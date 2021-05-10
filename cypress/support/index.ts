import 'cypress-file-upload'
import 'cypress-plugin-snapshots/commands'

function createJWT(payload) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: 'QPGlrFRW9NQNmM3UfEL5S8K4LOKQ47Kry6zQ0RcZE7s'
  }
  const signature = 'IcannotBeCheckedClientSide' // keycloak-js will only extract the payload
  return btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload)) + '.' + signature
}
Cypress.Commands.add('auth', () => {
  // Keycloak Auth Endpoint
  const SESSION_STATE = 'd2e9d5d1-6851-446c-b540-0fc875f35443'
  let nonce = '' // will be generated by keycloak-js and appended to iframe url

  cy.intercept(
    {
      method: 'GET', // intercept all requests to auth endpoint
      url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/protocol/openid-connect/auth*'
    },
    req => {
      const query = new URL(req.url).searchParams
      const redirect_uri = query.get('redirect_uri')
      const state = query.get('state')
      nonce = query.get('nonce') // keycloak-js generated a nonce that we need to include in our access token

      const CODE = `714db7dc-c19c-46c0-ba95-a1eed9421db2.${SESSION_STATE}.d991e11b-e2b0-4b73-ac03-cbd0c3e70fce`
      // and redirect to redirect_url, including state and a fake session_state and code
      req.reply({
        statusCode: 302,
        headers: {
          location: `${redirect_uri}#state=${state}&session_state=${SESSION_STATE}&code=${CODE}`
        }
      })
    }
  )

  // Keycloak Token Endpoint
  cy.intercept(
    {
      method: 'POST', // intercept all requests to token endpoint
      url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/protocol/openid-connect/token'
    },
    req => {
      const response = {
        // keycloak-js compares nonce, so this is the least possible payload
        access_token: createJWT({ nonce }),
        expires_in: 1800,
        refresh_expires_in: 79951,
        refresh_token: createJWT({ nonce }),
        token_type: 'bearer',
        id_token: createJWT({ nonce }),
        'not-before-policy': 1598019734,
        session_state: SESSION_STATE,
        scope: 'openid email veo-user profile'
      }
      // Reply default response
      req.reply({
        body: { ...response, session_state: SESSION_STATE }
      })
    }
  )

  // Keycloak Account Endpoint
  cy.intercept(
    {
      method: 'GET', // intercept all requests to account endpoint
      url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/account'
    },
    req => {
      // and reply currently logged in user
      req.reply({ fixture: 'auth/user.json' })
    }
  )

  // Veo Units
  cy.intercept(
    {
      method: 'GET', // GET VEO Units
      url: 'https://veo.develop.cpmsys.io/units'
    },
    req => {
      // Reply demo units
      req.reply({ fixture: 'auth/unit.json' })
    }
  )
})

Cypress.Commands.add('drag', { prevSubject: true }, subject => {
  cy.wrap(subject)
    .trigger('pointerdown', {
      which: 1,
      button: 0
    })
    .trigger('dragstart')
})

Cypress.Commands.add('drop', { prevSubject: true }, subject => {
  cy.wrap(subject)
    .trigger('dragover', 'bottom', { scrollBehavior: 'bottom', force: true })
    .trigger('drop', 'bottom', { scrollBehavior: 'bottom', force: true })
    .trigger('pointerup', {
      which: 1,
      button: 0
    })
})

Cypress.Commands.add('loadFse', formSchemaPath => {
  cy.intercept(
    {
      method: 'GET',
      url: /.*\/translations.*/
    },
    req => {
      req.reply({
        fixture: 'objectschema/translations.json'
      })
    }
  )
  cy.intercept(
    {
      method: 'GET',
      url: /.*\/schemas$/
    },
    req => {
      req.reply({
        fixture: 'objectschema/schemas.json'
      })
    }
  )

  cy.window().then(function(win: any) {
    win.$nuxt?.$router?.push('/editor')
  })

  cy.contains('.v-list-item--link', 'Formschema Editor')
    .should('have.attr', 'href', '/editor/formschema')
    .click()
    .wait(1)

  cy.intercept(
    {
      method: 'GET',
      url: /.*\/schemas\/process.*/
    },
    req => {
      req.reply({
        fixture: 'objectschema/process.json'
      })
    }
  )
  cy.get('.v-dialog--active').within(dialogEl => {
    cy.get('.v-window-item--active')
      .contains('Formschema importieren')
      .closest('.v-list-item--link')
      .click()
      .wait(1)
    cy.get('.v-window-item--active')
      .contains('.v-file-input', 'Formschema hochladen (.json)')
      .find('input[type="file"]')
      .attachFile(formSchemaPath)
      .wait(2000)
  })
  cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema')
})

Cypress.Commands.add('toMatchHtmlSnapshot', { prevSubject: true }, (subject, options) => {
  cy.wrap(
    Cypress.$(
      Cypress.$.parseHTML(
        subject[0].outerHTML.replace(/(input-\d+|list-\d+|radio-\d+)/g, '').replace(/data-v-\w+/g, 'data-v-123abc4d')
      )
    )
  ).toMatchSnapshot(options)
})
