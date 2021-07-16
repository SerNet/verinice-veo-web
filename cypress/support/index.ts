/// <reference types="cypress" />
import 'cypress-file-upload';
import 'cypress-plugin-snapshots/commands';
import '@cypress/code-coverage/support';
import { IBaseObject } from '../../lib/utils';

function createJWT(payload) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: 'QPGlrFRW9NQNmM3UfEL5S8K4LOKQ47Kry6zQ0RcZE7s'
  };
  const signature = 'IcannotBeCheckedClientSide'; // keycloak-js will only extract the payload
  return btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload)) + '.' + signature;
}
Cypress.Commands.add('auth', () => {
  // Keycloak Auth Endpoint
  const SESSION_STATE = 'd2e9d5d1-6851-446c-b540-0fc875f35443';
  let nonce = ''; // will be generated by keycloak-js and appended to iframe url

  cy.intercept(
    {
      method: 'GET', // intercept all requests to auth endpoint
      url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/protocol/openid-connect/auth*'
    },
    (req) => {
      const query = new URL(req.url).searchParams;
      const redirectUri = query.get('redirect_uri');
      const state = query.get('state');
      nonce = query.get('nonce'); // keycloak-js generated a nonce that we need to include in our access token

      const CODE = `714db7dc-c19c-46c0-ba95-a1eed9421db2.${SESSION_STATE}.d991e11b-e2b0-4b73-ac03-cbd0c3e70fce`;
      // and redirect to redirect_url, including state and a fake session_state and code
      req.reply({
        statusCode: 302,
        headers: {
          location: `${redirectUri}#state=${state}&session_state=${SESSION_STATE}&code=${CODE}`
        }
      });
    }
  );

  // Keycloak Token Endpoint
  cy.intercept(
    {
      method: 'POST', // intercept all requests to token endpoint
      url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/protocol/openid-connect/token'
    },
    (req) => {
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
      };
      // Reply default response
      req.reply({
        body: { ...response, session_state: SESSION_STATE }
      });
    }
  );

  // Keycloak Account Endpoint
  cy.intercept(
    {
      method: 'GET', // intercept all requests to account endpoint
      url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/account'
    },
    (req) => {
      // and reply currently logged in user
      req.reply({ fixture: 'auth/user.json' });
    }
  );

  // Veo Units
  cy.intercept(
    {
      method: 'GET', // GET VEO Units
      url: 'https://veo.develop.cpmsys.io/units'
    },
    (req) => {
      // Reply demo units
      req.reply({ fixture: 'auth/unit.json' });
    }
  );
});

Cypress.Commands.add('drag', { prevSubject: true }, (subject) => {
  cy.wrap(subject)
    .trigger('pointerdown', {
      which: 1,
      button: 0
    })
    .trigger('dragstart');
});

Cypress.Commands.add('drop', { prevSubject: true }, (subject) => {
  cy.wrap(subject).trigger('dragover', 'bottom', { scrollBehavior: 'bottom' }).trigger('drop', 'bottom', { scrollBehavior: 'bottom' }).trigger('pointerup', {
    which: 1,
    button: 0
  });
});

const textGroupRegExp = /(text|group)_[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}/gi;

Cypress.Commands.add('toMatchHtmlSnapshot', { prevSubject: true }, (subject, options) => {
  cy.wrap(
    Cypress.$(
      Cypress.$.parseHTML(
        subject[0].outerHTML
          .replace(/(input-\d+|list-\d+|radio-\d+)/g, '')
          .replace(/data-v-\w+/g, 'data-v-123abc4d')
          .replace(textGroupRegExp, 'dynamic_text_group_title')
      )
    )
  ).toMatchSnapshot(options);
});

Cypress.Commands.add('goTo', (path) => {
  cy.window().then(function (win: any) {
    cy.location().then((location) => {
      // if the current URL is not the same as the URL to navigate, go to the new URL ("path")
      if (`${location.origin}${path}` !== location.href) {
        win.$nuxt.$router.push(path);
        cy.validateUrl(path);
      }
    });
  });
});

Cypress.Commands.add('validateUrl', (relativeUrl) => {
  // compare current with the own relativeUrl
  // IMPORTANT! Location and expect() should be used in this way in order to enable Cypress to wait until it is correct
  cy.location().should((location) => {
    expect(`${location.pathname}${location.search}`).to.equal(relativeUrl);
  });
});

Cypress.Commands.add('interceptLayoutCalls', (options?: IBaseObject) => {
  if (!options?.ignoreAllSchemas) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/schemas$/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/fetchAll.json'
        });
      }
    ).as('G_fetchSchemas');
  }

  if (!options?.ignoreSpecificSchemas) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/schemas\/(.+)$/
      },
      (req) => {
        const type = req.url.split('/').pop();
        const cleanType = type.split('?')[0];
        req.reply({
          fixture: `api/default/schemas/${cleanType}.json`
        });
      }
    ).as('G_fetchSchemas');
  }

  if (!options?.ignoreFetchAllForms) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/formsapi$/
      },
      (req) => {
        req.reply({
          fixture: 'api/forms/fetchAll.json'
        });
      }
    ).as('G_fetchForms');
  }

  if (!options?.ignoreSpecificForms) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/formsapi\/(.+)/
      },
      (req) => {
        const id = req.url.split('/').pop();
        req.reply({
          fixture: `api/forms/${id}.json`
        });
      }
    ).as('G_fetchFormSchema');
  }

  if (!options?.ignoreFetchAllCatalogs) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/catalogs\/\?/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/catalogs/fetchAll.json'
        });
      }
    ).as('G_fetchReports');
  }

  if (!options?.ignoreFetchAllCatalogs) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/catalogs\/(.+)\/items/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/catalogs/fetchAllItems.json'
        });
      }
    ).as('G_fetchReports');
  }

  if (!options?.ignoreFetchAllReports) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/reportsapi\/reports$/
      },
      (req) => {
        req.reply({
          fixture: 'api/reports/fetchAll.json'
        });
      }
    ).as('G_fetchReports');
  }

  if (!options?.ignoreTranslations) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/translations(.*)$/
      },
      (req) => {
        req.reply({
          fixture: 'translations/translations.json'
        });
      }
    ).as('G_fetchTranslations');
  }

  if (!options?.ignoreFetchAllUnits) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/units$/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/units/fetchAll.json'
        });
      }
    ).as('G_fetchUnits');
  }

  if (!options?.ignoreFetchAllDomains) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/domains\/$/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/domains/fetchAll.json'
        });
      }
    ).as('G_fetchDomains');
  }

  if (!options?.ignoreFetchSpecificDomains) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/domains\/(.+)$/
      },
      (req) => {
        const id = req.url.split('/').pop();
        req.reply({
          fixture: `api/default/domains/${id}.json`
        });
      }
    ).as('G_fetchDomain');
  }

  if (!options?.ignoreFetchAllEntities) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/
      },
      (req) => {
        const path = req.url.split('?')[0];
        const type = path.split('/').pop();
        req.reply({
          fixture: `api/default/entities/${type}/fetchAll.json`
        });
      }
    ).as('G_fetchObjects');
  }

  if (!options?.ignoreFetchSpecificEntities) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\/(.+)$/
      },
      (req) => {
        const url = req.url.split('/');
        const id = url.pop();
        const type = url.pop();

        req.reply({
          fixture: `api/default/entities/${type}/${id}.json`
        });
      }
    ).as('G_fetchObject');
  }
});
