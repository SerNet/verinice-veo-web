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

const defaultTestObjectData: TestObjectData = {
  owner: {},
  riskDefinition: 'GSRA',
  name: 'test-object-name',
  objectType: 'scope',
  objectTypePlural: 'scopes',
  subType: 'SCP_Scope',
  subTypePlural: 'Scopes',
  status: 'NEW'
};

type TestObjectData = {
  owner: object;
  riskDefinition: string;
  name: string;
  objectType: string;
  objectTypePlural: string;
  subType: string;
  subTypePlural?: string;
  status: string;
};

export function createObject({
  domainId = Cypress.env('dynamicTestData').unit?.domains?.[0]?.id || Cypress.env('dsgvoUnitId'),
  unitId = Cypress.env('dynamicTestData').unit.unitId,
  objectData = defaultTestObjectData,
  dynamicTestDataKey = 'testObject'
} = {}) {
  const owner = {
    targetUri: `https://api.develop.verinice.com/veo/units/${unitId}`
  };

  return cy
    .veoRequest({
      endpoint: `domains/${domainId}/${objectData.objectTypePlural}`,
      method: 'POST',
      body: { ...objectData, owner }
    })
    .then((res) => {
      logStatus('Creating test object', res);
      expect(res.status).to.equal(201);

      const object = { ...objectData, id: res.body.resourceId };

      // Store information for later use in the current test suite
      Cypress.env('dynamicTestData')[dynamicTestDataKey] = object;
      return object;
    });
}

export function deleteObject({
  objectType = Cypress.env('dynamicTestData').testObject.objectTypePlural,
  objectId = Cypress.env('dynamicTestData').testObject.id
} = {}) {
  cy.veoRequest({
    endpoint: `${objectType}/${objectId}`,
    method: 'DELETE'
  }).then((res) => {
    logStatus('Deleting test object', res);
    expect(res.status).to.eq(204);
  });
}

export function getObject({
  domainId = Cypress.env('dynamicTestData').unit.domains[0].id,
  objectTypePlural = Cypress.env('dynamicTestData').testObject.objectTypePlural,
  objectId = Cypress.env('dynamicTestData').testObject.id
}: { domainId?: string; objectTypePlural?: string; objectId?: string } = {}) {
  return cy
    .veoRequest({
      endpoint: `domains/${domainId}/${objectTypePlural}/${objectId}`,
      method: 'GET'
    })
    .then((res) => {
      logStatus('Getting test object', res);
      expect(res.status).to.equal(200);
      Cypress.env('dynamicTestData').testObject.raw = res.body;
      return { ...res.body, headers: { ...res.headers } };
    });
}

export function getModules({
  domainId = Cypress.env('dynamicTestData').unit.domains[0].id,
  unitId = Cypress.env('dynamicTestData').unit.unitId
} = {}) {
  return cy
    .veoRequest({
      endpoint: `domains/${domainId}/controls?unit=${unitId}&subType=CTL_Module&size=1`
    })
    .then((res) => {
      const modules = res.body.items;
      logStatus('Get modules (controls -> CTL_Module)', res);
      Cypress.env('dynamicTestData').modules = modules;
      return modules;
    });
}
