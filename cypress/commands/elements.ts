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
  cy.get('[data-component-name="breadcrumbs"]').contains(subTypeName).as('activeBreadcrumb');
  cy.get('@activeBreadcrumb').should('have.text', subTypeName);
  waitForPageToLoad();
}
