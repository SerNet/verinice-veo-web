/// <reference types="cypress" />

import { waitForPageToLoad } from './utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      checkSubTypePage: typeof checkSubTypePage;
    }
  }
}

export function checkSubTypePage(subTypeName: string) {
  cy.get('[data-component-name="filter-bar-active-filters"]').contains(subTypeName).as('activeFilters');
  cy.get('@activeFilters').should('have.text', subTypeName);
  waitForPageToLoad();
}
