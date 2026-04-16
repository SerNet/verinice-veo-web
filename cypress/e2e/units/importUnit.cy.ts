import { v4 as uuid } from 'uuid';
import { generateUnitDetails } from '../../support/setupHelpers';

type TestData = {
  unitId: string;
  unitName: string;
  elementId: string;
  importFilePath: string;
  domain: TestDomain;
};

type TestDomain = {
  id: string;
  name: string;
  abbreviation: string;
};

function setupTestData(): TestData {
  const unitDetails = generateUnitDetails('importUnit');
  const testRunId = uuid();

  return {
    unitId: uuid(),
    unitName: unitDetails.name as string,
    elementId: uuid(),
    importFilePath: `cypress/downloads/unit-import-${testRunId}.json`,
    domain: {
      id: uuid(),
      name: 'TISAX',
      abbreviation: 'TISAX'
    }
  };
}

function openImportWizard() {
  cy.getCustom('[data-veo-test="import-unit-btn"]').click();
  cy.getCustom('[data-veo-test="unit-import-wizard"]');
}

function uploadUnitImportFile(testData: TestData) {
  const payload = createImportPayload(testData);

  cy.writeFile(testData.importFilePath, payload);
  cy.getCustom('[data-veo-test="unit-import-file-input"]').invoke('show').selectFile(testData.importFilePath);

  cy.getCustom('[data-veo-test="unit-import-selected-file"]').should('be.visible');
  clickNext();
}

function checkImportedUnitDetails(testData: TestData) {
  cy.getCustom('[data-veo-test="unit-details-card"]').within(() => {
    cy.getCustom('input').clear().type(testData.unitName);
    cy.getCustom('input').then(($input: JQuery<HTMLInputElement>) => {
      expect($input[0].value).to.equal(testData.unitName);
    });
  });

  clickNext();
}

function importUnit(testData: TestData) {
  cy.intercept('POST', `${Cypress.env('veoApiUrl')}/units/import`, {
    statusCode: 201,
    body: {
      resourceId: testData.unitId
    }
  }).as('importUnit');

  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units`, [createImportedUnitResponse(testData)]).as(
    'getImportedUnits'
  );

  cy.getCustom('[data-veo-test="import-unit-submit-btn"]').click();
  cy.wait('@importUnit').then((interception) => {
    expect(interception.response?.statusCode).to.equal(201);

    const body = interception.request.body;
    expect(body.unit.name).to.equal(testData.unitName);
    expect(body.risks).to.have.length.greaterThan(0);

    Cypress.env('dynamicTestData').unit = {
      name: testData.unitName,
      unitId: interception.response?.body?.resourceId
    };
    Cypress.env('dynamicTestData').testUnits.push(Cypress.env('dynamicTestData').unit);
  });
  cy.wait('@getImportedUnits');
}

function testUnitCard(testData: TestData) {
  cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units`);

  cy.containsCustom(testData.unitName).parents('[data-veo-test="veo-card"]').as('testUnitCard');
  cy.getCustom('@testUnitCard').should('contain', testData.unitName);
}

function clickNext() {
  cy.getCustom('[data-veo-test="import-unit-next-btn"]').should('not.be.disabled').click();
}

function createImportPayload({ unitId, unitName, elementId, domain }: TestData) {
  return JSON.stringify({
    domains: [
      {
        id: domain.id,
        name: domain.name,
        abbreviation: domain.abbreviation
      }
    ],
    elements: [
      {
        id: elementId,
        name: 'Mock imported organization',
        owner: { targetUri: `/veo/units/${unitId}` },
        domains: {
          [domain.id]: {
            subType: 'SCP_Organization',
            status: 'NEW'
          }
        },
        type: 'scope'
      }
    ],
    risks: [
      {
        designator: 'RSK-000001',
        domains: {
          [domain.id]: {
            reference: { targetUri: `/veo/domains/${domain.id}` },
            riskDefinitions: {
              GSRA: {
                riskValues: []
              }
            }
          }
        }
      }
    ],
    unit: {
      id: unitId,
      name: unitName,
      domains: [{ targetUri: `/veo/domains/${domain.id}` }]
    }
  });
}

function createImportedUnitResponse({ unitId, unitName, domain }: TestData) {
  return {
    id: unitId,
    name: unitName,
    createdAt: '2026-04-16T12:00:00.000Z',
    createdBy: 'cypress',
    updatedAt: '2026-04-16T12:00:00.000Z',
    domains: [
      {
        id: domain.id,
        name: domain.name,
        abbreviation: domain.abbreviation,
        targetUri: `/veo/domains/${domain.id}`
      }
    ]
  };
}

describe('import units', () => {
  let testData: TestData;

  beforeEach(() => {
    testData = setupTestData();

    cy.deleteTestUnits();
    cy.login();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
  });

  afterEach(() => {
    cy.deleteTestUnits();
  });

  it('imports a unit through the unit import wizard', () => {
    openImportWizard();
    uploadUnitImportFile(testData);
    checkImportedUnitDetails(testData);
    importUnit(testData);
    testUnitCard(testData);
  });
});
