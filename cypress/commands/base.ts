/// <reference types="cypress" />

import { upperFirst } from 'lodash';
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
export function getCustom(selector: string, options = {}): any {
  waitForLoadersToDisappear();
  return cy.get(selector, options);
}

export function containsCustom(selector: string, content?: string | RegExp, options = {}): any {
  waitForLoadersToDisappear();

  if (content) {
    return cy.contains(selector, content, options);
  } else {
    return cy.contains(selector, options);
  }
}
