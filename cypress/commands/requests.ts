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
export function veoRequest({
  url,
  method,
  requestBody,
  waitForRequestMethod = true
}: {
  url: string;
  method: string;
  requestBody?: any;
  waitForRequestMethod?: boolean;
}): any {
  const options = requestBody ? { method, json: requestBody } : { method };

  if (Cypress.env('debug')) cy.log('veoRequest arguments:', JSON.stringify(arguments));

  // Make sure window.request is available
  if (waitForRequestMethod) {
    cy.visit('/security');
    cy.get('[data-component-name="breadcrumbs"]').as('prepareVeoRequest');
    cy.wait(1000);
  }

  return cy.window().then((win) => {
    return win.request(url, options).then((response: any) => {
      if (Cypress.env('debug')) cy.log(JSON.stringify(response));
      return response;
    });
  });
}
