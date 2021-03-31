/// <reference path="../support/index.d.ts" />

describe('Authentication test', () => {
  beforeEach(() => {
    cy.auth()
  })
  it('Objectschema', () => {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/process?domains=GDPR%2CISO_27001'
      },
      req => {
        req.reply({ fixture: 'objectschema/process.json' })
      }
    )

    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas'
      },
      req => {
        req.reply({
          knownSchemas: ['control', 'scope', 'asset', 'process', 'incident', 'document', 'person', 'scenario']
        })
      }
    )

    cy.visit('http://localhost:3000/editor')
    cy.get<HTMLLinkElement>('.v-main__wrap a.v-list-item.v-list-item--link')
      .first()
      .should('have.attr', 'href', '/editor/objectschema')

    cy.get<HTMLLinkElement>('.v-main__wrap a.v-list-item.v-list-item--link')
      .first()
      .click()

    cy.get('.v-dialog--active #input-86')
      .parent()
      .click()

    cy.get('.v-menu__content .v-list-item__title').should('contain.text', 'Process')

    cy.get('.v-menu__content .v-list-item__title')
      .contains('Process')
      .click()

    cy.get('.v-dialog--active .v-btn__content')
      .contains('Weiter')
      .click()

    // Compare each link with units
    // cy.get<HTMLLinkElement>('.v-list:not(.v-list--nav) a').each((el, i) => {
    //   const unit = units[i]
    //   const link = cy.wrap(el)
    //   link.should('have.attr', 'href', `/unit-${unit.id}`)
    //   link.find('.v-list-item__title').should('contain.text', unit.name)
    // })
  })
})
