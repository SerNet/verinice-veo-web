/// <reference types="cypress" />

declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      acceptAllCookies: typeof acceptAllCookies;
    }
  }
}

export function acceptAllCookies() {
  cy.get('button').contains('Accept all cookies').click();
}
