import { generateUnitDetails } from '../support/setupHelpers';

/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      importUnit: typeof importUnit;
    }
  }
}

export function importUnit({ fixturePath }: { fixturePath: string }): Cypress.Chainable {
  return cy.deleteTestUnits().then(() => {
    return cy.fixture(fixturePath).then((json) => {
      const initialUnitDetails = generateUnitDetails('ElementsDetailsTab');
      const body = prepareUnitData(json, initialUnitDetails.name);

      cy.veoRequest({
        endpoint: 'units/import',
        method: 'POST',
        body
      }).then((res) => {
        const unitDetails = {
          ...initialUnitDetails,
          unitId: res.body.resourceId,
          domains: body.domains
        };
        Cypress.env('dynamicTestData').unit = unitDetails;
        Cypress.env('dynamicTestData').testUnits.push(unitDetails);
        return res;
      });
    });
  });
}

function prepareUnitData(json: any, unitName: string) {
  const replacementData = [
    {
      key: '{%%DOMAIN_ID%%}',
      val: Cypress.env('dsgvoUnitId')
    },
    {
      key: '{%%UNIT_NAME%%}',
      val: unitName
    },
    {
      key: '{%%UNIT_ID%%}',
      val: '116e3e6f-e6f6-4011-9220-e2117c30084c'
    }
  ];

  let _json = JSON.stringify(json);
  replacementData.forEach((dp) => {
    _json = _json.replaceAll(dp.key, dp.val);
  });

  return JSON.parse(_json);
}
