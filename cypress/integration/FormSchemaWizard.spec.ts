/// <reference path="../support/index.d.ts" />

import { getEditorData } from '../support/utils';

describe('Formschema Wizard', () => {
  before(() => {
    cy.auth();

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('/editor');
  });

  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/translations.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/translations.json'
        });
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo-forms\.develop\.\w+\.\w+\/*/
      },
      (req) => {
        req.reply({
          fixture: 'forms/fetchAllForms.json'
        });
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo-reporting\.develop\.\w+\.\w+\/reports/
      },
      (req) => {
        req.reply({
          fixture: 'reports/fetchAllReports.json'
        });
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo\.develop\.\w+\.\w+\/domains/
      },
      (req) => {
        req.reply({
          fixture: 'default/fetchAllDomains.json'
        });
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas$/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/schemas.json'
        });
      }
    );
    cy.window().then(function (win: any) {
      win.$nuxt?.$router?.push('/editor');
    });
    cy.contains('.v-list-item--link', 'Formschema Editor').should('have.attr', 'href', '/editor/formschema').click();
  });

  it('ckecks navigation between wizard start, back button, and formschema create and import', function () {
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').find('.v-list-item.v-list-item--link').should('contain.text', 'Formschema erstellen').should('contain.text', 'Formschema importieren');
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').find('h2').should('contain.text', 'Formschema erstellen');
      cy.get('.v-card__actions').contains('Zurück').click();
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').find('h2').should('contain.text', 'Formschema importieren');
    });
  });

  it('creates a new formschema based on own uploaded objectschema', function () {
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-file-input', 'Objektschema hochladen (.json)').find('input[type="file"]').attachFile('objectschema/empty.json');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'test');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on own objectschema by code insterting', function () {
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-tab', 'Code einfügen').click();
      cy.get('.v-window-item--active')
        .find('.editor .cm-content')
        .closest('.d-flex.flex-column')
        .then((el: any) => {
          cy.fixture('objectschema/empty.json').then((emptyOS) => {
            // TODO: this is a hack to load OS in Code Editor. It needs a better solution
            el[0].__vue__.$emit('input', JSON.stringify(emptyOS));
          });
        });
      cy.contains('.v-btn', 'Codeänderungen übernehmen').click();
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'test');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on control objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/control.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/control.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Control{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'control');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on scope objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/scope.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/scope.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Scope{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'scope');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on asset objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/asset.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/asset.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Asset{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'asset');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on process objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/process.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Process{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on incident objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/incident.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/incident.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Incident{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'incident');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on document objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/document.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/document.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Document{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'document');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on person objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/person.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/person.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Person{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'person');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('creates a new formschema based on scenario objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/scenario.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/scenario.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Scenario{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'scenario');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('imports a formschema by upload based on process objectschema', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/process.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-file-input', 'Formschema hochladen (.json)').find('input[type="file"]').attachFile('formschema/empty-process.json');
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('imports a formschema by code inserting based on process objectschema ', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/process.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-tab', 'Code einfügen').click();
      cy.get('.v-window-item--active')
        .find('.editor .cm-content')
        .closest('.d-flex.flex-column')
        .then((el: any) => {
          cy.fixture('formschema/empty-process.json').then((emptyProcessFS) => {
            // TODO: this is a hack to load OS in Code Editor. It needs a better solution
            el[0].__vue__.$emit('input', JSON.stringify(emptyProcessFS));
          });
        });
      cy.contains('.v-btn', 'Codeänderungen übernehmen').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('imports a formschema by uploading based on process objectschema also manually uploaded', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/process.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').click();
      cy.get('.v-window-item--active').contains('.v-file-input', 'Formschema hochladen (.json)').find('input[type="file"]').attachFile('formschema/empty-process.json');
      cy.contains('.v-window-item--active .v-file-input', 'Objektschema hochladen (.json)').find('input[type="file"]').attachFile('objectschema/process.json');
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });

  it('imports a formschema by uploading based on process objectschema by code insterting ', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/process.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').click();
      cy.get('.v-window-item--active').contains('.v-file-input', 'Formschema hochladen (.json)').find('input[type="file"]').attachFile('formschema/empty-process.json');
      cy.contains('h2', 'Objektschema importieren');
      cy.contains('.v-window-item--active .v-tab', 'Code einfügen').click();
      cy.get('.v-window-item--active')
        .find('.editor .cm-content')
        .closest('.d-flex.flex-column')
        .then((el: any) => {
          cy.fixture('objectschema/process.json').then((processOS) => {
            // TODO: this is a hack to load OS in Code Editor. It needs a better solution
            el[0].__vue__.$emit('input', JSON.stringify(processOS));
          });
        });
      cy.contains('.v-btn', 'Codeänderungen übernehmen').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
    cy.get('.mdi-code-tags').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });
});
