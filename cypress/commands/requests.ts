/*
 * verinice.veo web
 * Copyright (C) 2024 jae
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/// <reference types="cypress" />

import { omit } from 'lodash';

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
  return getToken().then((token) => {
    const opts = { method: 'GET', headers: generateHeaders(token, options.headers), ...omit(options, 'headers'), url };
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

function generateHeaders(token: string, headers: RequestHeaders) {
  return {
    Authorization: token,
    'If-Match': '',
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers
  };
}
