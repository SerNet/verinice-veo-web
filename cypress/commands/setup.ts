/// <reference types="cypress" />

import { createObject } from '../requests/objects';
import { generateUnitDetails } from '../support/setupHelpers';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setupVeo: typeof setupVeo;
    }
  }
}

export const objectDataDefaults = {
  owner: {},
  name: 'test-object-name',
  objectType: 'scope',
  objectTypePlural: 'scopes',
  subType: 'SCP_Scope',
  subTypePlural: 'Scopes',
  status: 'NEW'
};

export function setupVeo(unitName?: string, domains: string[] = ['IT-Grundschutz'], objectData = objectDataDefaults) {
  return cy.deleteTestUnits().then(() => {
    const unitDetails = generateUnitDetails(unitName || 'Veo');
    cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: domains }).then(() => {
      const _domains = Cypress.env('dynamicTestData').testUnits[0]?.domains;
      if (!_domains) return;
      _domains.forEach((domain) => {
        createObject({
          domainId: domain.id,
          objectData: {
            riskDefinition: domain.name === 'DS-GVO' ? 'DSRA' : 'GSRA',
            ...objectData
          }
        });
      });
      cy.login();
      cy.acceptAllCookies();
    });
  });
}
