/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      importUnit: typeof importUnit;
    }
  }
}

export function importUnit(unitName: string, { fixturePath }: { fixturePath: string }) {
  cy.fixture(fixturePath).then((json) => {
    cy.veoRequest({
      endpoint: 'units/import',
      method: 'POST',
      body: prepareUnitData(json, unitName)
    }).then((res) => {
      const unitDetails = { unitId: res.body.resourceId };
      Cypress.env('dynamicTestData').unit = unitDetails;
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
