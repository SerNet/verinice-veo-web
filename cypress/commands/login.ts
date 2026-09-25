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

export function login({ username, password, isLocalhost = Cypress.expose('isLocalhost') || false }: LoginParams = {}) {
  cy.env(['testUser']).then(({ testUser }) => {
    const resolvedUsername = username ?? testUser.name;
    const resolvedPassword = password ?? testUser.pw;

    cy.session(
      [resolvedUsername, resolvedPassword],
      () => {
        cy.visit('/login');
        cy.getCustom('[data-veo-test="login-btn-login"]', { timeout: 30000 }).click();

        if (!isLocalhost) {
          applyCredentials({ username: resolvedUsername, password: resolvedPassword });
        } else {
          cy.origin(
            Cypress.expose('veoOidcUrl'),
            { args: { username: resolvedUsername, password: resolvedPassword } },
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
  });
}

function applyCredentials({ username, password }: { username: string; password: string }) {
  cy.getCustom('input').first().type(username);
  cy.getCustom('input#password').type(password);
  cy.getCustom('input#kc-login').click();
}
