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
  cy.getCustom('[data-component-name="breadcrumbs"]').contains(subTypeName).as('activeBreadcrumb');
  cy.getCustom('@activeBreadcrumb').should('have.text', subTypeName);
  waitForPageToLoad();
}
