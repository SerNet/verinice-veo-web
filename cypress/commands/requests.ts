/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      veoRequest: typeof veoRequest;
    }
  }
  interface Window {
    request: (url: string, options: any) => Record<any, any>;
  }
}

/**
 * Wrap veo's `window.request` method into a cypress command.
 */
export function veoRequest({ url, method, requestBody }: { url: string; method: string; requestBody?: any }): any {
  const options = requestBody ? { method, json: requestBody } : { method };

  // Make sure window.request is available
  cy.visit('/security');
  cy.get('[data-component-name="breadcrumbs"]', { timeout: 60000 }).as('prepareVeoRequest');

  return cy.window().then((win) => {
    return win.request(url, options).then((response) => {
      cy.log(JSON.stringify(response));
      return response;
    });
  });
}
