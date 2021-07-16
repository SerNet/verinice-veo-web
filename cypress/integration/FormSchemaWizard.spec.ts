/// <reference path="../support/index.d.ts" />
import { getEditorData } from '../support/utils';

describe('Formschema Wizard', () => {
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

  it.only('ckecks navigation between wizard start, back button, and formschema create and import', function () {
    cy.goTo('/editor').goTo('/editor/formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-file-input', 'Objektschema hochladen (.json)').find('input[type="file"]').attachFile('api/default/schemas/empty.json');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=custom');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
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
          cy.fixture('api/default/schemas/empty.json').then((emptyOS) => {
            // TODO: this is a hack to load OS in Code Editor. It needs a better solution
            el[0].__vue__.$emit('input', JSON.stringify(emptyOS));
          });
        });
      cy.contains('.v-btn', 'Codeänderungen übernehmen').click();
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=custom');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Control{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=control');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Scope{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=scope');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Asset{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=asset');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Process{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=process');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Incident{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=incident');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Document{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=document');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Person{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=person');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Scenario{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl('/editor/formschema?name=Test%20Formschema&subtype=TF&os=scenario');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-file-input', 'Formschema hochladen (.json)').find('input[type="file"]').attachFile('formschema/empty-process.json');
    });
    cy.validateUrl('/editor/formschema?fs=custom');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
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
    cy.validateUrl('/editor/formschema?fs=custom');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').click();
      cy.get('.v-window-item--active').contains('.v-file-input', 'Formschema hochladen (.json)').find('input[type="file"]').attachFile('formschema/empty-process.json');
      cy.contains('.v-window-item--active .v-file-input', 'Objektschema hochladen (.json)').find('input[type="file"]').attachFile('api/default/schemas/process.json');
    });
    cy.validateUrl('/editor/formschema?fs=custom&os=custom');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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
    cy.goTo('/editor').goTo('/editor/formschema');
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
          cy.fixture('api/default/schemas/process.json').then((processOS) => {
            // TODO: this is a hack to load OS in Code Editor. It needs a better solution
            el[0].__vue__.$emit('input', JSON.stringify(processOS));
          });
        });
      cy.contains('.v-btn', 'Codeänderungen übernehmen').click();
    });
    cy.validateUrl('/editor/formschema?fs=custom&os=custom');
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');
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

  it('navigates to wizard state by URL where formschema will be created based on own objectschema', function () {
    cy.goTo('/editor').goTo('/editor/formschema?name=Test%20Formschema&subtype=TF&os=custom');
    cy.wait('@G_fetchTranslations');
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-select', 'Objektschematyp').should('contain.text', 'Eigenes');
      cy.contains('.v-tab', 'Datei hochladen').should('have.class', 'v-tab--active');
      cy.contains('.v-file-input', 'Objektschema hochladen (.json)').should('contain.text', 'Objektschema hochladen (.json)');
    });
  });

  it('navigates to wizard state by URL where formschema will be created based on existing objectschema', function () {
    cy.goTo('/editor').goTo('/editor/formschema?name=Test%20Formschema&subtype=TF&os=process');
    cy.wait(['@G_fetchTranslations']);
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
  });

  it('navigates to wizard state by URL where own formschema can be imported', function () {
    cy.goTo('/editor').goTo('/editor/formschema?fs=custom');
    cy.wait(['@G_fetchTranslations']);
    cy.get('.v-dialog--active').within(() => {
      cy.get('h2').should('contain.text', 'Formschema importieren');
      cy.contains('.v-tab', 'Datei hochladen').should('have.class', 'v-tab--active');
      cy.contains('.v-file-input', 'Formschema hochladen (.json)').should('contain.text', 'Formschema hochladen (.json)');
      cy.contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').should('not.have.class', 'v-input--is-label-active');
    });
  });

  it('navigates to wizard state by URL where own formschema can be imported with own objectschema', function () {
    cy.goTo('/editor').goTo('/editor/formschema?fs=custom&os=custom');
    cy.wait(['@G_fetchTranslations']);
    cy.get('.v-dialog--active').within(() => {
      cy.get('h2').should('contain.text', 'Formschema importieren');
      cy.contains('.v-tab', 'Datei hochladen').should('have.class', 'v-tab--active');
      cy.contains('.v-file-input', 'Formschema hochladen (.json)').should('contain.text', 'Formschema hochladen (.json)');
      cy.contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').should('have.class', 'v-input--is-label-active');
    });
  });

  it('imports existing formschema by URL ', function () {
    cy.goTo('/editor').goTo('/editor/formschema?fs=minimal');
    cy.wait(['@G_fetchTranslations']);
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
  });
});
