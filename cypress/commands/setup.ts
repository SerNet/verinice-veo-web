import { createObject } from '../requests/objects';
import { generateUnitDetails } from '../support/setupHelpers';

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
  const unitDetails = generateUnitDetails(unitName || 'Veo');
  return cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: domains }).then(() => {
    domains.forEach((domain) => {
      createObject({
        objectData: {
          riskDefinition: domain === 'DS-GVO' ? 'DSRA' : 'GSRA',
          ...objectData
        }
      });
    });
    cy.login();
    cy.acceptAllCookies();
  });
}
