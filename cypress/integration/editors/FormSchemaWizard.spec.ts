/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Jonas Heitmann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/// <reference path="../../support/index.d.ts" />
/// <reference types="cypress" />

import { getEditorData } from '../../support/utils';

const editorPath = '/unit-d496f98f-c051-443c-9b1f-65d65b64996d/domains/domain-ed67e4d7-c657-4479-ba8a-c53999d2930a/editor/';
const formSchemaEditorPath = editorPath + 'formschema';

describe('Formschema Wizard', () => {
  before(() => {
    cy.auth();
    cy.interceptLayoutCalls();

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit(editorPath);
    cy.wait('@G_fetchSchemas');
  });

  beforeEach(() => {
    cy.interceptLayoutCalls();
  });

  it('ckecks navigation between wizard start, back button, and formschema create and import', function () {
    cy.goTo(editorPath).goTo(formSchemaEditorPath);
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
    cy.goTo(editorPath).goTo(formSchemaEditorPath);
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sortierwert').type('a1');
      cy.get('.v-window-item--active').contains('.v-select', 'Objektschematyp').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-file-input', 'Objektschema hochladen (.json)').find('input[type="file"]').attachFile('api/default/schemas/empty.json');
      cy.get('.v-window-item--active').contains('.v-select', 'Sub Typ').type('TF');

      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });

    cy.validateUrl(formSchemaEditorPath + '?name=Test%20Formschema&sorting=a1&objectType=custom&subType=TF');
    cy.get('h1').should('contain.text', 'Formschema-Editor - Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Sub Typ').find('.v-select__selection').should('have.text', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'Test');
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
    cy.goTo(editorPath).goTo(formSchemaEditorPath);
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema erstellen').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Name des Formschemas').type('Test Formschema');
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
      cy.contains('.v-btn', 'Objektschema importieren').click();
      cy.get('.v-window-item--active').contains('.v-text-field', 'Sub Typ').type('TF');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl(formSchemaEditorPath + '?name=Test%20Formschema&objectType=custom&subType=TF');
    cy.get('h1').should('contain.text', 'Formschema-Editor - Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Sub Typ').find('.v-select__selection').should('have.text', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'Test');
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
    cy.goTo(editorPath).goTo(formSchemaEditorPath);
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-select', 'Formschema').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-file-input', 'Formschema hochladen (.json)').find('input[type="file"]').attachFile('formschema/empty-process.json');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });

    cy.validateUrl(formSchemaEditorPath + '?formSchema=custom');
    cy.get('h1').should('contain.text', 'Formschema-Editor - Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Sub Typ').find('.v-select__selection').should('have.text', 'PRO_DataTransfer');
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
    cy.goTo(editorPath).goTo(formSchemaEditorPath);
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-select', 'Formschema').type('Eigenes{enter}');
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
      cy.contains('.v-btn', 'Formschema importieren').click();
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl(formSchemaEditorPath + '?formSchema=custom');
    cy.get('h1').should('contain.text', 'Formschema-Editor - Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Sub Typ').find('.v-select__selection').should('have.text', 'PRO_DataTransfer');
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
    cy.goTo(editorPath).goTo(formSchemaEditorPath);
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-select', 'Formschema').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').click();
      cy.get('.v-window-item--active').contains('.v-file-input', 'Formschema hochladen (.json)').find('input[type="file"]').attachFile('formschema/empty-process.json');
      cy.contains('.v-window-item--active .v-file-input', 'Objektschema hochladen (.json)').find('input[type="file"]').attachFile('api/default/schemas/process.json');
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl(formSchemaEditorPath + '?formSchema=custom&forceOwnSchema=true');
    cy.get('h1').should('contain.text', 'Formschema-Editor - Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Sub Typ').find('.v-select__selection').should('have.text', 'PRO_DataTransfer');
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
    cy.goTo(editorPath).goTo(formSchemaEditorPath);
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('Formschema importieren').closest('.v-list-item--link').click();
      cy.get('.v-window-item--active').contains('.v-select', 'Formschema').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').click();
      cy.get('.v-window-item--active').contains('.v-file-input', 'Formschema hochladen (.json)').find('input[type="file"]').attachFile('formschema/empty-process.json');
      cy.get('[data-cy=veo-fse-wizard-state-import-objectschema-input]').within(() => {
        cy.contains('.v-tab', 'Code einfügen').click();
        cy.get('.editor .cm-content')
          .closest('.d-flex.flex-column')
          .then((el: any) => {
            cy.fixture('api/default/schemas/process.json').then((processOS) => {
              // TODO: this is a hack to load OS in Code Editor. It needs a better solution
              el[0].__vue__.$emit('input', JSON.stringify(processOS));
            });
          });
        cy.contains('.v-btn', 'Objektschema importieren').click();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });
    cy.validateUrl(formSchemaEditorPath + '?formSchema=custom&forceOwnSchema=true');
    cy.get('h1').should('contain.text', 'Formschema-Editor - Test Formschema');
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Sub Typ').find('.v-select__selection').should('have.text', 'PRO_DataTransfer');
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
    cy.goTo(editorPath).goTo(formSchemaEditorPath + '?name=Test%20Formschema&objectType=custom');
    cy.wait('@G_fetchTranslations');
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Objektschematyp').should('contain.text', 'Eigenes');
      cy.contains('.v-tab', 'Datei hochladen').should('have.class', 'v-tab--active');
      cy.contains('.v-file-input', 'Objektschema hochladen (.json)').should('contain.text', 'Objektschema hochladen (.json)');
    });
  });

  it('navigates to wizard state by URL where formschema will be created based on existing objectschema', function () {
    cy.goTo(editorPath).goTo(formSchemaEditorPath + '?name=Test%20Formschema&objectType=process&subType=PRO_DataTransfer');
    cy.wait(['@G_fetchTranslations']);
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Sub Typ').find('.v-select__selection').should('have.text', 'PRO_DataTransfer');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
  });

  it('navigates to wizard state by URL where own formschema can be imported', function () {
    cy.goTo(editorPath).goTo(formSchemaEditorPath + '?formSchema=custom');
    cy.wait(['@G_fetchTranslations']);
    cy.get('.v-dialog--active').within(() => {
      cy.get('h2').should('contain.text', 'Formschema importieren');
      cy.contains('.v-tab', 'Datei hochladen').should('have.class', 'v-tab--active');
      cy.contains('.v-file-input', 'Formschema hochladen (.json)').should('contain.text', 'Formschema hochladen (.json)');
      cy.contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').should('not.have.class', 'v-input--is-label-active');
    });
  });

  it('navigates to wizard state by URL where own formschema can be imported with own objectschema', function () {
    cy.goTo(editorPath).goTo(formSchemaEditorPath + '?formSchema=custom&forceOwnSchema=true');
    cy.wait(['@G_fetchTranslations']);
    cy.get('.v-dialog--active').within(() => {
      cy.get('h2').should('contain.text', 'Formschema importieren');
      cy.contains('.v-tab', 'Datei hochladen').should('have.class', 'v-tab--active');
      cy.contains('.v-file-input', 'Formschema hochladen (.json)').should('contain.text', 'Formschema hochladen (.json)');
      cy.contains('.v-input--checkbox', 'Existierendes Objektschema selbst hochladen.').should('have.class', 'v-input--is-label-active');
    });
  });

  it('imports existing formschema by URL ', function () {
    cy.goTo(editorPath).goTo(formSchemaEditorPath + '?formSchema=minimal');
    cy.wait(['@G_fetchTranslations']);
    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-select', 'Sub Typ').find('.v-select__selection').should('have.text', 'PRO_DataTransfer');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');
      cy.get('.v-card__actions').contains('.v-btn', 'Abbrechen').click();
    });
  });
});
