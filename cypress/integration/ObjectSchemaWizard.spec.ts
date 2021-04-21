/// <reference path="../support/index.d.ts" />

import { getCurrentOS } from '../support/utils'

describe('Objectschema Wizard', () => {
  before(() => {
    cy.auth()

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('http://localhost:3000/editor', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'language', { value: 'de-DE' });
        Object.defineProperty(win.navigator, 'languages', { value: ['de'] });
        Object.defineProperty(win.navigator, 'accept_languages', { value: ['de'] });
      },
      headers: {
        'Accept-Language': 'de',
      }
    })
  })

  beforeEach(() => {
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
    cy.window().then(function (win: any) {
      win.$nuxt?.$router?.push('/editor')
    })
    cy.contains('.v-list-item--link', 'Objektschema Editor')
      .should('have.attr', 'href', '/editor/objectschema')
      .click()
      .wait(1)
  })

  it('ckecks navigation between wizard start, back button, and objectschema create and import', function () {
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

  it('creates a new objectschema', function () {
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('Stattdessen ein neues Objektschema erstellen')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
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
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/empty.json').then(emptyOS => {
          cy.wrap(JSON.stringify(emptyOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports own objectschema by uploading', function () {
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Eigenes{enter}')
      cy.get('.v-window-item--active')
        .contains('.v-file-input', 'Objektschema hochladen (.json)')
        .find('input[type="file"]')
        .attachFile('objectschema/process.json')
        .wait(2000)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Test')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Test Beschreibung')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/empty.json').then(emptyOS => {
          cy.wrap(JSON.stringify(emptyOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports own objectschema by inserting code', function () {
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
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
            el[0].__vue__.$emit('input', JSON.stringify(emptyOS, null, 2))
          })
        })
      cy.contains('.v-btn', 'Codeänderungen übernehmen')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Test')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Test Beschreibung')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/empty.json').then(emptyOS => {
          cy.wrap(JSON.stringify(emptyOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports existing control objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/control*'
      },
      req => {
        req.reply({
          fixture: 'objectschema/control.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Control{enter}')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Control')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Schema for Control')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/control.json').then(controlOS => {
          cy.wrap(JSON.stringify(controlOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports existing scope objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/scope*'
      },
      req => {
        req.reply({
          fixture: 'objectschema/scope.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Scope{enter}')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Scope')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Schema for Scope')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/scope.json').then(scopeOS => {
          cy.wrap(JSON.stringify(scopeOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports existing asset objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/asset*'
      },
      req => {
        req.reply({
          fixture: 'objectschema/asset.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Asset{enter}')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Asset')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Schema for Asset')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/asset.json').then(assetOS => {
          cy.wrap(JSON.stringify(assetOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports existing process objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/process*'
      },
      req => {
        req.reply({
          fixture: 'objectschema/process.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Process{enter}')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Process')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Schema for Process')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/proces.json').then(procesOS => {
          cy.wrap(JSON.stringify(procesOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports existing incident objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/incident*'
      },
      req => {
        req.reply({
          fixture: 'objectschema/incident.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Incident{enter}')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Incident')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Schema for Incident')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/incident.json').then(incidentOS => {
          cy.wrap(JSON.stringify(incidentOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports existing document objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/document*'
      },
      req => {
        req.reply({
          fixture: 'objectschema/document.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Document{enter}')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Document')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Schema for Document')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/document.json').then(documentOS => {
          cy.wrap(JSON.stringify(documentOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports existing person objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/person*'
      },
      req => {
        req.reply({
          fixture: 'objectschema/person.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Person{enter}')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Person')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Schema for Person')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/person.json').then(personOS => {
          cy.wrap(JSON.stringify(personOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })

  it('imports existing scenario objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/scenario*'
      },
      req => {
        req.reply({
          fixture: 'objectschema/scenario.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('.v-text-field', 'Typ des Objektschemas')
        .type('Scenario{enter}')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Weiter')
        .click()
        .wait(1)
    })
    cy.contains('.v-text-field', 'Objektschema')
      .find('input')
      .should('have.value', 'Scenario')
    cy.contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Schema for Scenario')
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.fixture('objectschema/scenario.json').then(scenarioOS => {
          cy.wrap(JSON.stringify(scenarioOS, null, 2)).should('eq', JSON.stringify(currentOS, null, 2))
        })
      })
    })
  })
})
