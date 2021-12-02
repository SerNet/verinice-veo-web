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

describe('Objectschema Wizard', () => {
  before(() => {
    cy.auth();
    cy.interceptLayoutCalls();

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('/editor/');
    cy.wait('@G_fetchSchemas');
  });

  beforeEach(() => {
    cy.interceptLayoutCalls();
  });

  it('ckecks navigation between wizard start, back button, and objectschema create and import', function () {
    cy.goTo('/editor/').goTo('/editor/objectschema/');
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
    cy.goTo('/editor/').goTo('/editor/objectschema/');
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
    cy.goTo('/editor/').goTo('/editor/objectschema/');
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
    cy.goTo('/editor/').goTo('/editor/objectschema/');
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

  it('imports existing process objectschema', function () {
    cy.goTo('/editor/').goTo('/editor/objectschema/');

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Process{enter}');

      // The dialog might close before the scrollTop event of VSelect is processed, causing an error and failing e2e tests
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.get('.v-card__actions').contains('.v-btn', 'Weiter').click();
    });

    cy.get('.veo-page__title').contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'process');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Process');
    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).toMatchSnapshot();
    });
    cy.validateUrl('/editor/objectschema?os=process');
  });

  it('creates own objectschema by URL', function () {
    cy.goTo('/editor/').goTo('/editor/objectschema?type=Testtyp&description=Testbeschreibung');
    cy.contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'Testtyp');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Testbeschreibung');
  });

  it('navigates automatically to the state in wizard by URL, where own objectschema can be uploaded', function () {
    cy.goTo('/editor/').goTo('/editor/objectschema?os=custom');
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-select', 'Typ des Objektschemas').should('contain.text', 'Eigenes');
      cy.contains('.v-tab', 'Datei hochladen').should('have.class', 'v-tab--active');
      cy.contains('.v-file-input', 'Objektschema hochladen (.json)').should('contain.text', 'Objektschema hochladen (.json)');
    });
  });

  it('imports existing objectschema by URL', function () {
    cy.goTo('/editor/').goTo('/editor/objectschema?os=process');
    cy.contains('.v-text-field', 'Objektschema').find('input').should('have.value', 'process');
    cy.contains('.v-text-field', 'Beschreibung').find('input').should('have.value', 'Schema for Process');
  });
});
