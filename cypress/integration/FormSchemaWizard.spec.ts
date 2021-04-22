/// <reference path="../support/index.d.ts" />

import { getCurrentOS } from '../support/utils'

describe('Formschema Wizard', () => {
  before(() => {
    cy.auth()

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('http://localhost:3000/editor')
  })

  beforeEach(() => {
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
  })

  it('ckecks navigation between wizard start, back button, and formschema create and import', function() {
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .find('.v-list-item.v-list-item--link')
        .should('contain.text', 'Formschema erstellen')
        .should('contain.text', 'Formschema importieren')
      cy.get('.v-window-item--active')
        .contains('Formschema erstellen')
        .closest('.v-list-item--link')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .find('h2')
        .should('contain.text', 'Formschema erstellen')
      cy.get('.v-card__actions')
        .contains('Zurück')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .contains('Formschema importieren')
        .closest('.v-list-item--link')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .find('h2')
        .should('contain.text', 'Formschema importieren')
    })
  })
})
