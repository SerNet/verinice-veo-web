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
  cy.get("body").then(($body) => {
    if ($body.find('[data-veo-test="cookies-btn-accept-all"]').length) {
      cy.get('[data-veo-test="cookies-btn-accept-all"]').click();
    } else {
      cy.log('no cookie banner present');
    }
  });
}
