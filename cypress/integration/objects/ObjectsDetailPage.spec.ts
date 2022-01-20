/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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

import { cloneDeep } from 'lodash';

import { VEO_API_ENTITY_REGEX } from '../../support';

/**
 * Tests for {@link ~/pages/_unit/domains/_domain/objects/_id.vue}
 */
describe('Objects details', () => {
  beforeEach(() => {
    cy.auth();

    cy.interceptLayoutCalls();
  });

  before(() => {
    cy.auth();

    cy.interceptLayoutCalls();
    cy.visit('/unit-d496f98f-c051-443c-9b1f-65d65b64996d/domains/domain-ed67e4d7-c657-4479-ba8a-c53999d2930a/objects/process-0effd1b5-4675-4386-abf0-dc464562546e');
    cy.wait('@G_fetchObject');
  });

  it('should enter something in the form and reset it. The data should equal the original data', function () {
    function getFormData(component: JQuery<HTMLElement>) {
      return JSON.stringify((component[0] as any).__vue__.$parent.modifiedObject);
    }

    let initialFormData;
    cy.get('#app > div.v-application--wrap > main > div > div').then((component) => {
      initialFormData = cloneDeep(getFormData(component));
    });

    cy.get('.vf-wrapper').contains('.v-text-field', 'Beschreibung').type('something');
    cy.get('#app > div.v-application--wrap > main > div > div').then((component) => {
      cy.wrap(getFormData(component)).should('not.equal', initialFormData);
    });
    cy.get('[data-cy=veo-objects-index-page-reset-button]').click();
    cy.get('#app > div.v-application--wrap > main > div > div').then((component) => {
      cy.wrap(getFormData(component)).should('equal', initialFormData);
    });
  });

  it('enters something in the form and sends it to the server. The api request should equal the modified data', function () {
    let modifiedObject;
    cy.fixture('api/default/entities/processes/0effd1b5-4675-4386-abf0-dc464562546e.json').then((process) => {
      modifiedObject = process;
      modifiedObject.description = modifiedObject.description + 'something';
      modifiedObject.displayName = 'PRO-12 DÜ2 Gelb';
    });

    cy.intercept(
      {
        method: 'PUT',
        url: VEO_API_ENTITY_REGEX
      },
      (req) => req.reply(modifiedObject)
    ).as('putObject');

    cy.get('.vf-wrapper').contains('.v-text-field', 'Beschreibung').type('something');

    cy.get('[data-cy=veo-objects-index-page-save-button]').click();

    cy.wait('@putObject').should((interception) => {
      cy.wrap(JSON.stringify(interception.request.body)).should('equal', JSON.stringify(modifiedObject));
    });
    cy.get('.v-snack__wrapper').should('be.visible');
  });

  it('loads an old revision and restores it, while checking whether the information box is present ', function () {
    let oldVersion;
    cy.fixture('api/history/revisions/processes/0effd1b5-4675-4386-abf0-dc464562546e.json').then((revisions) => {
      oldVersion = revisions[0].content;
      oldVersion.displayName = 'PRO-12 DÜ2 Gelb';
    });

    cy.intercept(
      {
        method: 'PUT',
        url: VEO_API_ENTITY_REGEX
      },
      (req) => req.reply(oldVersion)
    ).as('putObject');

    // Check "original" state (focus() so the form is scrolled to the top)
    cy.get('.vf-wrapper').contains('.v-text-field', 'Beschreibung').find('input').focus().should('have.value', 'Prozess mit Subtype Datenübertragung');

    // Open history and select second newest version
    cy.get('.v-slide-group__prev').click();
    cy.contains('.v-tab', 'verlauf').click();
    cy.get('[data-cy=veo-object-history-history-list]').should('be.visible');
    cy.get('[data-cy=veo-object-history-history-list]').find('.v-item-group').children().eq(1).click();
    cy.get('[data-cy=veo-objects-index-page-old-version-alert]').should('be.visible');
    cy.get('.vf-wrapper')
      .contains('.v-text-field', 'Beschreibung')
      .find('input')
      .should('have.value', 'Prozess mit Subtype Datenübertragung mit unnötig langer Beschreibung die am besten verkürzt wird');

    // Clicks retore button and checks whether the correct body is sent to the api
    cy.get('[data-cy=veo-objects-index-page-restore-button]').click();
    cy.wait('@putObject').should((interception) => {
      cy.wrap(JSON.stringify(interception.request.body)).should('equal', JSON.stringify(oldVersion));
    });
  });
});
