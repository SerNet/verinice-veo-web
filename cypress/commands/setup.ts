import { createObject } from '../requests/objects';
import { generateUnitDetails } from '../support/setupHelpers';

export function setupVeo(unitName?: string) {
  const unitDetails = generateUnitDetails(unitName || 'Veo');
  return cy
    .createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['IT-Grundschutz', 'DS-GVO'] })
    .then(() => {
      createObject();
      cy.login();
      cy.acceptAllCookies();
    });
}
export function setupAxeVeo(unitName?: string) {
  const unitDetails = generateUnitDetails(unitName || 'Veo');
  return cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['DS-GVO'] }).then(() => {
    cy.login();
    cy.acceptAllCookies();
  });
}
