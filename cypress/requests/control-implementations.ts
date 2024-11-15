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

import { logStatus } from './utils';
import { getObject, getModules } from './objects';

export function addControlImplementation({
  domainId = Cypress.env('dynamicTestData').unit.domains[0].id,
  unitId = Cypress.env('dynamicTestData').unit.unitId
} = {}) {
  return getObject().then((testObject) => {
    getModules({
      domainId,
      unitId
    }).then((modules) => {
      const CITargetUri = modules[0]._self;
      const requestParams = {
        endpoint: `domains/${domainId}/scopes/${testObject.id}`,
        method: 'PUT',
        headers: {
          'If-Match': testObject.headers.etag
        },
        body: { ...testObject, controlImplementations: [{ control: { targetUri: CITargetUri } }] }
      };

      // Finally: add CI
      cy.veoRequest(requestParams).then((res) => {
        logStatus('Add control implementation', res);
        expect(res.status).to.eq(200);
        return res;
      });
    });
  });
}

export function fetchRequirementImplementations({
  objectType = Cypress.env('dynamicTestData').testObject.objectTypePlural,
  objectId = Cypress.env('dynamicTestData').testObject.id,
  moduleId = Cypress.env('dynamicTestData').modules[0].id
} = {}) {
  return cy
    .veoRequest({
      endpoint: `${objectType}/${objectId}/control-implementations/${moduleId}/requirement-implementations?size20&sortBy=control.abbreviation&sortOrder=asc`
    })
    .then((res) => {
      const ris = res.body.items;
      Cypress.env('dynamicTestData').ris = ris;
      return ris;
    });
}
