/// <reference path="../support/index.d.ts" />

import { interceptLayoutCalls } from '../support/intercepts';

describe('Objectschema Editor', () => {
  before(() => {
    cy.auth();
  });

  beforeEach(() => {
    interceptLayoutCalls();
    cy.visit(`/unit-4fe0f8dc-ee20-41d0-b115-2d6586d3d5d7/domains/domain-442938ae-e497-48d3-81f1-d6b2ba9260fa/forms/form-bb71cd48-75cf-494e-a052-0d3236af9911`);
  });

  it('Tests whether the correct api request is send if the user wants to go a page forward/back', function () {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.get('.v-data-footer__icons-after .v-btn__content').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.get('.mdi-chevron-left').click();
  });
});
