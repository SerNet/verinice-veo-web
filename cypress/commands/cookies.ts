/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      acceptAllCookies: typeof acceptAllCookies;
    }
  }
}

type TCYAcceptAllCookiesParams = { useGUI?: false };
export function acceptAllCookies({ useGUI }: TCYAcceptAllCookiesParams = {}) {
  if (useGUI) {
    cy.get('[data-veo-test="cookies-btn-accept-all"]').click();
    return;
  }
  window.localStorage.setItem('accepted-cookies', '{"required":true,"optional":true,"selected":[]}');
}
