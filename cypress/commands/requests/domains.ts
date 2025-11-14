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

import type { IVeoDomain } from '../../../composables/api/queryDefinitions/domains';

/// <reference types="cypress" />

import { v4 as uuid } from 'uuid';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createDomain: typeof createDomain;
      deleteDomain: typeof deleteDomain;
      deleteDomainsOlderThan: typeof deleteDomainsOlderThan;
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
  const isTestDomain = Cypress.env('dynamicTestData')?.testUnits[0]?.domain?.name.startsWith('CY-TEST-DOMAIN-');
  if (!domainId || !isTestDomain) return;
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

export function deleteDomainsOlderThan(hours = 3) {
  const logStyles = 'color: deepPink; font-weight: bold;';
  const someTimeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Get domains, and find the ones older than $hours
  return cy
    .veoRequest({
      endpoint: `domains`,
      method: 'GET',
      failOnStatusCode: false
    })
    .then((response) => {
      const domains = response.body;
      console.warn(`%cFound ${domains.length} domains.`, logStyles);

      const oldDomains = domains.filter((domain: any) => {
        const createdAt = new Date(domain.createdAt);
        return createdAt < someTimeAgo && domain.name.startsWith('CY-');
      });

      // Log info
      if (oldDomains.length > 0) {
        console.warn(`%cStarting to delete ${oldDomains.length} domains older than ${hours} hours...`, logStyles);
      } else {
        console.warn(`%cNo domains are older than ${hours} hours.`, logStyles);
        return;
      }

      // Delete domains
      const deletionRequests = oldDomains.forEach((domain: IVeoDomain, index: number) => {
        cy.veoRequest({
          endpoint: `content-creation/domains/${domain.id}`,
          method: 'DELETE',
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 204) {
            console.warn(`%c${index + 1}: Deleted domain ${domain.id}`, logStyles);
          } else {
            console.error(`Failed to delete domain ${domain.name} | ${domain.id}. Status: ${response.status}`);
          }
        });
      });
      return Cypress.Promise.all(deletionRequests ?? []);
    });
}
