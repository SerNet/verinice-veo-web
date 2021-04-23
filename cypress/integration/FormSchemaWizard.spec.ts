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

  it('creates a new formschema based on own uploaded objectschema', function() {
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('Formschema erstellen')
        .closest('.v-list-item--link')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Name des Formschemas')
        .type('Test Formschema')
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Sub Typ')
        .type('TF')
      cy.get('.v-window-item--active')
        .contains('.v-select', 'Objektschematyp')
        .type('Eigenes{enter}')
      cy.get('.v-window-item--active')
        .contains('.v-file-input', 'Objektschema hochladen (.json)')
        .find('input[type="file"]')
        .attachFile('objectschema/empty.json')
        .wait(2000)
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema')
    cy.get('.mdi-wrench')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.contains('.v-text-field', 'Name des Formschemas')
        .find('input')
        .should('have.value', 'Test Formschema')
      cy.contains('.v-text-field', 'Sub Typ')
        .find('input')
        .should('have.value', 'TF')
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp')
        .find('input')
        .should('have.value', 'test')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Abbrechen')
        .click()
        .wait(1)
    })
    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getCurrentOS(editor)).then(currentOS => {
          cy.fixture('formschema/empty.json').then(emptyOS => {
            cy.wrap(JSON.stringify(emptyOS)).should('eq', JSON.stringify(currentOS))
          })
        })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })
  })

  it('creates a new formschema based on own objectschema by inserting code', function() {
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('Formschema erstellen')
        .closest('.v-list-item--link')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Name des Formschemas')
        .type('Test Formschema')
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Sub Typ')
        .type('TF')
      cy.get('.v-window-item--active')
        .contains('.v-select', 'Objektschematyp')
        .type('Eigenes{enter}')
      cy.get('.v-window-item--active')
        .contains('.v-tab', 'Code einfügen')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .find('.editor .cm-content')
        .closest('.d-flex.flex-column')
        .then((el: any) => {
          cy.fixture('objectschema/empty.json').then(emptyOS => {
            // TODO: this is a hack to load OS in Code Editor. It needs a better solution
            el[0].__vue__.$emit('input', JSON.stringify(emptyOS))
          })
        })
      cy.contains('.v-btn', 'Codeänderungen übernehmen')
        .click()
        .wait(1)
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema')
    cy.get('.mdi-wrench')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.contains('.v-text-field', 'Name des Formschemas')
        .find('input')
        .should('have.value', 'Test Formschema')
      cy.contains('.v-text-field', 'Sub Typ')
        .find('input')
        .should('have.value', 'TF')
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp')
        .find('input')
        .should('have.value', 'test')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Abbrechen')
        .click()
        .wait(1)
    })
    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getCurrentOS(editor)).then(currentOS => {
          cy.fixture('formschema/empty.json').then(emptyOS => {
            cy.wrap(JSON.stringify(emptyOS)).should('eq', JSON.stringify(currentOS))
          })
        })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })
  })
})
