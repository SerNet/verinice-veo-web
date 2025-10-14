/*
 * verinice.veo web
 * Copyright (C) 2025 jae
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

import { v4 as uuid } from 'uuid';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createDomain: typeof createDomain;
      deleteDomain: typeof deleteDomain;
    }
  }
  interface Window {
    request: (url: string, options: any) => Record<any, any>;
  }
}

type TestDomain = {
  name: string;
  authority?: string;
};

const defaultTestDomain = {
  name: 'CY-TEST-DOMAIN-',
  authority: 'ACME Corp'
};

export function createDomain(domainData: TestDomain = { ...defaultTestDomain, name: defaultTestDomain.name + uuid() }) {
  const requestOptions = {
    endpoint: `content-creation/domains`,
    method: 'POST',
    headers: {
      'If-Match': ''
    },
    body: domainData
  };

  // Make domain data available inside of tests
  return cy.veoRequest(requestOptions).then((response) => {
    Cypress.env('dynamicTestData').testDomain = {
      ...domainData,
      id: response.body.resourceId
    };
    return response;
  });
}

export function deleteDomain(domainId: string = Cypress.env('dynamicTestData')?.testUnits[0]?.domains[0]?.id) {
  if (!domainId) return;
  return cy.veoRequest({
    endpoint: `content-creation/domains/${domainId}`,
    method: 'DELETE',
    headers: {
      'If-Match': ''
    },
    // Domains cannot be deleted if associated with a unit,
    // which causes a 409 Conflict if a test unit was not cleaned up properly
    // `failOnStatusCode: false` prevents the test from failing in these cases
    failOnStatusCode: false
  });
}
