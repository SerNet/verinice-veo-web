/// <reference path="../support/index.d.ts" />

import { interceptLayoutCalls } from '../support/intercepts';

describe('Objectschema Editor', () => {
  before(() => {
    cy.auth();
  });

  beforeEach(() => {
    interceptLayoutCalls();
    cy.visit(`/unit-d496f98f-c051-443c-9b1f-65d65b64996d/domains/domain-ed67e4d7-c657-4479-ba8a-c53999d2930a/forms/form-93d11b86-1e39-4786-a73f-0f17ed8794ee/`);
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
