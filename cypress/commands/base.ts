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

<<<<<<< Updated upstream
export function containsCustom(selector: string, options = {}) {
  waitForLoadersToDisappear();
  return cy.contains(selector, options);
=======
export function selectFirstSubType(elementType: string, callback: (args: any) => void, iterations: number = 1) {
  cy.containsCustom('div[sub-group="true"] > div', new RegExp(`^${upperFirst(elementType)}$`))
    .should('be.visible')
    .parent()
    .find('a')
    .filter((index, $subType) => $subType.innerText !== 'All')
    .slice(0, iterations)
    .each(($subType) => {
      if ($subType.length) {
        callback($subType);
      }
    });
>>>>>>> Stashed changes
}
