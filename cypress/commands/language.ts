/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      languageTo: typeof languageTo;
    }
  }
}

export function languageTo(language: string) {
  cy.get('button[data-component-name="language-select"]').click();
  cy.get('div[role="listbox"] div').contains(language).click();
}
