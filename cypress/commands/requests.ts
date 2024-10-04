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

type RequestHeaders = { Authorization: string; 'Content-type': string; Accept: string; 'If-Match': string };
type RequestOptions = { endpoint: string; method?: string; headers?: RequestHeaders; body?: any };

export function veoRequest(options: RequestOptions): Cypress.Chainable<any> {
  const url = `${Cypress.env('veoApiUrl')}/${options.endpoint}`;
  cy.log(url);
  return getToken().then((token) => {
    const opts = { method: 'GET', headers: generateHeaders(token), ...options, url };
    return cy.request(opts).then((response) => {
      return response;
    });
  });
}

// veoRequest helpers
function getToken(): Cypress.Chainable<any> {
  const user = Cypress.env('testUser');
  const keycloak = Cypress.env('keycloak');
  const url = `${keycloak.baseUrl}/auth/realms/${keycloak.realm}/protocol/openid-connect/token`;

  const body = {
    username: user.name,
    password: user.pw,
    grant_type: 'password',
    client_id: keycloak.clientId
  };

  const requestOptions = {
    url,
    body,
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  };

  return cy.request(requestOptions).then((res) => {
    return `Bearer ${res.body.access_token}`;
  });
}

function generateHeaders(token: string, etag = '') {
  return {
    Authorization: token,
    'If-Match': etag,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
}
