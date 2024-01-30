/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login: typeof login;
    }
  }
}

interface LoginParams {
  username?: string;
  password?: string;
  isLocalhost?: boolean;
}

export function login({
  username = Cypress.env('testUser').name,
  password = Cypress.env('testUser').pw,
  isLocalhost = Cypress.env('isLocalhost') || false,
}: LoginParams = {}) {
  cy.session(
    [username, password],
    () => {
      cy.visit('/login');
      cy.get('[data-veo-test="login-btn-login"]', { timeout: 30000 }).click();

      if (!isLocalhost) {
        applyCredentials({ username, password });
      } else {
        cy.origin(
          Cypress.env('veoOidcUrl'),
          { args: { username, password } },
          ({ username, password }) => {
            // Currently Cypress does not allow passing a fn to cy.origin,
            // using a custom command could work, but is still experimental
            cy.get('input').first().type(username);
            cy.get('input#password').type(password);
            cy.get('input#kc-login').click();
          }
        );
      }
    },
    { cacheAcrossSpecs: true }
  );
}

function applyCredentials({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  cy.get('input').first().type(username);
  cy.get('input#password').type(password);
  cy.get('input#kc-login').click();
}
