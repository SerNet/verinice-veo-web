/*
 * verinice.veo web
 * Copyright (C) 2022  Markus Werner
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
import { FIRST_STEPS_COMPLETED } from '../../../util/LocalStorage';

/**
 * Tests for {@link ~/pages/_unit/domains/_domain/objects/index.vue}
 */
describe('Objects overview', () => {
  beforeEach(() => {
    cy.auth();

    cy.interceptLayoutCalls();
  });

  before(() => {
    cy.auth();

    cy.interceptLayoutCalls();
    localStorage.setItem(FIRST_STEPS_COMPLETED, 'true');
    cy.visit(`/unit-d496f98f-c051-443c-9b1f-65d65b64996d/domains/domain-ed67e4d7-c657-4479-ba8a-c53999d2930a/objects?objectType=scope`);
    cy.wait('@G_fetchObjects');
  });

  it.skip('should display all scopes ', function () {
    cy.fixture('api/default/entities/scopes/fetchAll.json').then((scopes) => {
      cy.get('.v-data-footer__pagination').should('contain.text', `1-10 von ${scopes.totalItemCount}`);
    });
  });

  it.skip('should be possible to cancel filter dialog without changing filters', function () {
    cy.location('href').then((oldHref) => {
      // open filter dialog
      cy.get('[data-cy=veo-objects-overview-page-filter-button]').click();
      cy.get('[data-cy=veo-filter-dialog-filter-option]').each((el) => {
        // try to change all inputs/selects
        cy.wrap(el).type('{downarrow}{downarrow}{enter}');
      });
      // send escape to close dialog
      cy.get('body').type('{esc}');
      // check wether url remains the same
      cy.location('href').should('eq', oldHref);
    });
  });

  it.skip('should filter objects and serialize filters to url and chips', function () {
    cy.location().then((loc) => {
      // open filter dialog
      cy.get('[data-cy=veo-objects-overview-page-filter-button]').click();
      cy.get('[data-cy=veo-filter-dialog-filter-option]').contains('Scope').type('Process{enter}');
      cy.get('[data-cy=veo-filter-dialog-filter-option]').find('[name=designator]').type('PRO{enter}');
      cy.get('[data-cy=veo-filter-dialog-filter-option]').find('[name=name]').type('grün{enter}');
      // submit filters
      cy.get('[data-cy=veo-filter-dialog-submit-button]').click();
      // check API call
      cy.wait('@G_fetchObjects').then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.pathname.split('/').pop()).eql('processes');
        expect(url.searchParams.get('designator')).eql('PRO');
        expect(url.searchParams.get('name')).eql('grün');
      });
      // check wether chips are displayed correctly
      cy.get('[data-cy=veo-objects-overview-page-chips]').get('.v-chip').should('have.length', 3);
      cy.get('[data-cy=veo-objects-overview-page-chips]').get('.v-chip').contains('Objekttyp').parent().next().should('have.text', 'Process');
      cy.get('[data-cy=veo-objects-overview-page-chips]').get('.v-chip').contains('Designator').parent().next().should('have.text', 'PRO');
      cy.get('[data-cy=veo-objects-overview-page-chips]').get('.v-chip').contains('Objektname').parent().next().should('have.text', 'grün');
      // check wether url remains the same
      cy.location('pathname').should('eq', loc.pathname);
      // ...but query parameters have changed
      cy.location('search').then((search) => {
        const params = new URLSearchParams(search);
        expect(params.get('objectType')).eq('process');
        expect(params.get('designator')).eq('PRO');
        expect(params.get('name')).eq('grün');
      });
    });
  });

  it.skip('should be possible to remove filters via chips', function () {
    cy.get('[data-cy=veo-objects-overview-page-chips]').get('.v-chip').contains('Designator').parents('.v-chip').find('.v-chip__close').click();
    // check API call
    cy.wait('@G_fetchObjects').then((interception) => {
      const url = new URL(interception.request.url);
      expect(url.pathname.split('/').pop()).eql('processes');
      expect(url.searchParams.get('designator')).eqls(null);
      expect(url.searchParams.get('name')).eql('grün');
    });
    // check wether query parameters have changed
    cy.location('search').then((search) => {
      const params = new URLSearchParams(search);
      expect(params.get('objectType')).eq('process');
      expect(params.get('designator')).eq(null);
      expect(params.get('name')).eq('grün');
    });
  });

  it('should be possible create a new entity', function () {
    cy.get('[data-cy=veo-objects-overview-page-create-button]').click();
    cy.get('.v-dialog .vf-control').contains('Name*').parents('.v-input').type('Testobjekt{enter}');
    cy.get('.v-dialog .v-select').contains('subType').parents('.v-input').type('SCP_Controller{enter}');
    cy.get('.v-dialog .vf-control').contains('status').parents('.v-input').type('NEW{enter}');
    cy.get('[data-cy=veo-create-object-dialog-save-button]').click();
    cy.wait('@G_createObject').then((interception) => {
      cy.log(interception.request.url);
      cy.log(JSON.stringify(interception.request.body));
      expect(interception.request.body.owner.targetUri).match(/\/units\/d496f98f-c051-443c-9b1f-65d65b64996d$/);
      expect(interception.request.body).deep.contains({
        name: 'Testobjekt',
        domains: { 'ed67e4d7-c657-4479-ba8a-c53999d2930a': { subType: 'SCP_Controller', status: 'NEW' } }
      });
    });
  });
});
