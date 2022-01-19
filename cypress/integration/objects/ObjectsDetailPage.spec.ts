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
    function getFormData() {
      // eslint-disable-next-line no-unused-expressions
      cy.get('#app > div.v-application--wrap > main > div > div').should('not.be.undefined');
      return (cy.$$('#app > div.v-application--wrap > main > div > div')[0] as any).__vue__.$parent.modifiedObject;
    }

    const originalData = JSON.stringify(getFormData());
    cy.get('.vf-wrapper').contains('.v-text-field', 'Beschreibung').type('something');
    cy.wait(4000);
    cy.wrap(JSON.stringify(getFormData())).should('not.equal', originalData);
    cy.get('[data-cy]=veo-objects-index-page-restore-button').click();
    cy.wrap(JSON.stringify(getFormData())).should('equal', originalData);
  });
});
