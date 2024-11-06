/// <reference types="cypress" />

import { waitForLoadersToDisappear } from './utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getCustom: typeof getCustom;
      containsCustom: typeof containsCustom;
    }
  }
}

// Override the default Cypress commands
export function getCustom(selector: string, options = {}) {
  waitForLoadersToDisappear();
  return cy.getCustom(selector, options);
}

export function containsCustom(selector: string, options = {}) {
  waitForLoadersToDisappear();
  return cy.contains(selector, options);
}
