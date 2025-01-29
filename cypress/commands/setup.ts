import { createObject } from '../requests/objects';
import { generateUnitDetails } from '../support/setupHelpers';

export function setupVeo(unitName?: string) {
  const unitDetails = generateUnitDetails(unitName || 'Veo');
  return cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['IT-Grundschutz'] }).then(() => {
    createObject();
    cy.login();
    cy.acceptAllCookies();
  });
}
