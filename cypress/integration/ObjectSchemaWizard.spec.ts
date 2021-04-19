/// <reference path="../support/index.d.ts" />

import { getCurrentOS } from '../support/utils'

describe('Objectschema Editor', () => {
  before(() => {
    cy.auth()
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
          fixture: 'objectschema/schemas.json'
        })
      }
    )

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('http://localhost:3000/editor')
  })

  beforeEach(() => {
    cy.contains('Objektschema Editor')
      .closest('.v-list-item.v-list-item--link')
      .should('have.attr', 'href', '/editor/objectschema')
      .click()
      .wait(1)
  })

  it('ckecks navigation between wizard start, back button, and objectschema create and import', function() {
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__actions')
        .contains('Zurück')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .find('.v-list-item.v-list-item--link')
        .should('contain.text', 'Objektschema erstellen')
        .should('contain.text', 'Objektschema importieren')

      cy.get('.v-window-item--active')
        .contains('Objektschema erstellen')
        .closest('.v-list-item--link')
        .click()
        .wait(1)

      cy.get('.v-window-item--active')
        .find('h2')
        .should('contain.text', 'Objektschema erstellen')

      cy.get('.v-card__actions')
        .contains('Zurück')
        .click()
        .wait(1)

      cy.get('.v-window-item--active')
        .contains('Objektschema importieren')
        .closest('.v-list-item--link')
        .click()
        .wait(1)

      cy.get('.v-window-item--active')
        .find('h2')
        .should('contain.text', 'Objektschema importieren')

      cy.get('.v-window-item--active')
        .contains('Stattdessen ein neues Objektschema erstellen')
        .click()
        .wait(1)

      cy.get('.v-window-item--active')
        .find('h2')
        .should('contain.text', 'Objektschema erstellen')
    })
  })

  it('creates a new objectschema', function() {
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('Stattdessen ein neues Objektschema erstellen')
        .click()
        .wait(1)

      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Schema-Typ')
        .type('Test')
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Beschreibung')
        .type('Test Beschreibung')

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })

    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Test')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Test Beschreibung')

    cy.get('.editor .cm-content').then(function(editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/empty.json').then(emptyOS => {
          cy.wrap(JSON.stringify(emptyOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })
})
