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
  localhost?: boolean;
}

const testUser =
  Cypress.env('testUser') ||
  {
    name: Cypress.env('TESTUSER_NAME'),
    pw: Cypress.env('TESTUSER_PASS')
  };

const isLocalhost = Cypress.env('isLocalhost') || false;

export function login({
  username = testUser.name,
  password = testUser.pw,
  localhost = isLocalhost
}: LoginParams = {}) {

  cy.session([username, password], () => {
    cy.visit('/login');
    cy.get('button').contains('Login').click();

    if(!localhost) {
      applyCredentials({ username, password });
    }
    else {
      cy.origin(
        'https://auth.staging.verinice.com',
        { args: { username, password } }, ({ username, password }) => {
          // Currently Cypress does not allow passing a fn,
          // using a custom command could work, but is still experimental
          cy.get('input').first().type(username);
          cy.get('input#password').type(password);
          cy.get('input#kc-login').click();
        }
      );
    }
  }, { cacheAcrossSpecs: true } );
}

function applyCredentials({username, password}:{username: string, password:string}) {
  cy.get('input').first().type(username);
  cy.get('input#password').type(password);
  cy.get('input#kc-login').click();
}

