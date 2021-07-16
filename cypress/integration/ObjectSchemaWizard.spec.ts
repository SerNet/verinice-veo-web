/// <reference path="../support/index.d.ts" />
import { getEditorData } from '../support/utils';

describe('Objectschema Wizard', () => {
  before(() => {
    cy.auth();
    cy.interceptLayoutCalls();

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('/editor');
    cy.wait('@G_fetchSchemas');
  });

  beforeEach(() => {
    cy.interceptLayoutCalls();
  });

  it.only('ckecks navigation between wizard start, back button, and objectschema create and import', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__actions').contains('Zurück').click();
      cy.get('.v-window-item--active').find('.v-list-item.v-list-item--link').should('contain.text', 'Objektschema erstellen').should('contain.text', 'Objektschema importieren');
      cy.get('.v-window-item--active').contains('Objektschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').find('h2').should('contain.text', 'Objektschema erstellen');
      cy.get('.v-card__actions').contains('Zurück').click();
      cy.get('.v-window-item--active').contains('Objektschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').find('h2').should('contain.text', 'Objektschema importieren');
      cy.get('.v-window-item--active').contains('Stattdessen ein neues Objektschema erstellen').click();
      cy.get('.v-window-item--active').find('h2').should('contain.text', 'Objektschema erstellen');
    });
  });

  it('creates a new objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Stattdessen ein neues Objektschema erstellen').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Test');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Beschreibung').type('Test Beschreibung');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Test');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Test Beschreibung');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });

    cy.validateUrl('/editor/objectschema?type=Test&description=Test%20Beschreibung');
  });

  it('imports own objectschema by uploading', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    // TODO
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-file-input', 'Objektschema hochladen (.json)').find('input[type="file"]').attachFile('api/default/schemas/empty.json');
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Test');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Test Beschreibung');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=custom');
  });

  it('imports own objectschema by inserting code', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-tab', 'Code einfügen').click();
      cy.get('.v-window-item--active')
        .find('.editor .cm-content')
        .closest('.d-flex.flex-column')
        .then((el: any) => {
          cy.fixture('api/default/schemas/empty.json').then((emptyOS) => {
            // TODO: this is a hack to load OS in Code Editor. It needs a better solution
            el[0].__vue__.$emit('input', JSON.stringify(emptyOS));
          });
        });
      cy.contains('.v-btn', 'Codeänderungen übernehmen').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Test');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Test Beschreibung');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=custom');
  });

  it('imports existing control objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/control.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/control.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Control{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Control');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Control');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=control');
  });

  it('imports existing scope objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/scope.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/scope.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Scope{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Scope');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for scope');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=scope');
  });

  it('imports existing asset objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/asset.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/asset.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Asset{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Asset');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Asset');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=asset');
  });

  it('imports existing process objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/process.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Process{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });

    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Process');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Process');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=process');
  });

  it('imports existing incident objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/incident.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/incident.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Incident{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Incident');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Incident');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=incident');
  });

  it('imports existing document objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/document.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/document.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Document{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Document');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Document');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=document');
  });

  it('imports existing person objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/person.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/person.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Person{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Person');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Person');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=person');
  });

  it('imports existing scenario objectschema', function () {
    cy.goTo('/editor').goTo('/editor/objectschema');
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/scenario.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/scenario.json'
        });
      }
    );
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Scenario{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Scenario');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Scenario');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=scenario');
  });

  it('creates own objectschema by URL', function () {
    cy.goTo('/editor').goTo('/editor/objectschema?type=Testtyp&description=Testbeschreibung');
    cy.contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Testtyp');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Testbeschreibung');
  });

  it('navigates automatically to the state in wizard by URL, where own objectschema can be uploaded', function () {
    cy.goTo('/editor').goTo('/editor/objectschema?os=custom');
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-select', 'Typ des Objektschemas').should('contain.text', 'Eigenes');
      cy.contains('.v-tab', 'Datei hochladen').should('have.class', 'v-tab--active');
      cy.contains('.v-file-input', 'Objektschema hochladen (.json)').should('contain.text', 'Objektschema hochladen (.json)');
    });
  });

  it('imports existing objectschema by URL', function () {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/process.json'
        });
      }
    );
    cy.goTo('/editor').goTo('/editor/objectschema?os=process');
    cy.contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Process');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Process');
  });
});
