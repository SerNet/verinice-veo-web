/// <reference types="cypress" />

declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login: typeof login;
    }
  }
}

export function login({ username, password, localhost}:
{ username: string, password: string, localhost?: boolean }) {
  cy.session([username, password], () => {
    cy.visit('/login');
    cy.get('button').contains('Login').click();

    if(!localhost) {
      applyCredentials({ username, password });
    }
    else {
      cy.origin(
        'https://auth.staging.verinice.com',
        { args: {username, password, applyCredentials} }, ({ username, password }) => {
          applyCredentials({ username, password });
        }
      );
      cy.wait(4000);
      cy.reload();
    }
  }, { cacheAcrossSpecs: true } );
}

function applyCredentials({username, password}:{username: string, password:string}) {
  cy.get('input').first().type(username);
  cy.get('input#password').type(password);
  cy.get('input#kc-login').click();
}

