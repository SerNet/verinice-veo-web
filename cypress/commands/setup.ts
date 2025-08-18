import { createObject } from '../requests/objects';
import { generateUnitDetails } from '../support/setupHelpers';

export function setupVeo(unitName?: string, domains: string[] = ['IT-Grundschutz']) {
  const unitDetails = generateUnitDetails(unitName || 'Veo');
  return cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: domains }).then(() => {
    domains.forEach((domain) => {
      createObject({
        objectData: {
          owner: {},
          riskDefinition: domain === 'DS-GVO' ? 'DSRA' : 'GSRA',
          name: 'test-object-name',
          objectType: 'scope',
          objectTypePlural: 'scopes',
          subType: 'SCP_Scope',
          subTypePlural: 'Scopes',
          status: 'NEW'
        }
      });
    });
    cy.login();
    cy.acceptAllCookies();
  });
}
