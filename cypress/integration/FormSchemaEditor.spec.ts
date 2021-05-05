/// <reference path="../support/index.d.ts" />

import { getEditorData } from '../support/utils'

const textOrGroupLangRegex = /#lang\/(group|text)_[a-zA-Z0-9._-]+/g

describe('Formschema Editor', () => {
  before(() => {
    cy.auth()

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('http://localhost:3000/editor')

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
        .attachFile('formschema/empty-process.json')
        .wait(2000)
    })
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema')
  })

  it.only('drags and drops elements into dropzone and nests in each other', function() {
    cy.contains('.v-sheet', 'text').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'group').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'name').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / SensitiveData_SensitiveData').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / SensitiveData_comment').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / ProcessingDetails_typeOfSurvey').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / InternalRecipientLink').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / TypeOfDataProcessed').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'description').drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(0)
      .drop()

    cy.contains('.fse-input', 'Datenverarbeitung besonders sensitiver Daten?')
      .find('.handle')
      .drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(0)
      .drop()

    cy.contains('.v-sheet', 'group').drag()
    cy.get('.dropzone').drop()

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(0)
      .find('.handle')
      .eq(0)
      .drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(1)
      .drop()

    cy.contains('.v-sheet', 'text').drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(0)
      .drop()

    cy.contains('.fse-input', 'Art der verarbeiteten Daten')
      .find('.handle')
      .drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(0)
      .drop()

    cy.contains('.fse-input', 'Art der Erhebung')
      .find('.handle')
      .drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(1)
      .drop()

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).then(currentFS => {
          cy.fixture('formschema/drag-and-drop.json').then(compareFS => {
            cy.wrap(JSON.stringify(currentFS).replace(textOrGroupLangRegex, '')).should(
              'eq',
              JSON.stringify(compareFS).replace(textOrGroupLangRegex, '')
            )
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

it('compares downloaded schema with the actual one', function() {
  cy.get('.mdi-download')
    .closest('.v-btn')
    .click()
    .wait(1)
  cy.get('.mdi-code-tags')
    .closest('.v-btn')
    .click()
    .wait(1)
  cy.get('.v-dialog--active').within(dialogEl => {
    cy.get('.editor .cm-content').then(function(editor) {
      cy.wrap(getEditorData(editor)).then(currentFS => {
        cy.readFile('cypress/downloads/fs_Test Formschema.json').then(downloadedFS => {
          cy.wrap(JSON.stringify(currentFS)).should('eq', JSON.stringify(downloadedFS))
        })
      })
    })
    cy.get('.v-card__actions')
      .contains('.v-btn', 'Schließen')
      .click()
      .wait(1)
  })
})
