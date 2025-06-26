import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

const testData = {
  unitName: `TEST-NAME-${Math.random()}`,
  unitDesc: 'TEST DESCRIPTION FROM `createUnit.cy.ts`',
  domains: ['DS-GVO', 'IT-Grundschutz'],
  domainSelectors: ['[data-veo-test="domain-card-checkbox-ds-gvo"]', '[data-veo-test="domain-card-checkbox-itgs"]']
};

describe('checks Accessibility', () => {
  beforeEach(() => {
    unitDetails = generateUnitDetails('profiles');
    cy.login();
    cy.acceptAllCookies();
    cy.createUnit(unitDetails);
    cy.goToUnitSelection();
  });

  afterEach(() => cy.deleteUnit(unitDetails.name));

  it('checks accessibility in unit page', () => {
    cy.getVeoTestUnitCard(unitDetails.name);
    cy.checkAxeViolations();
  });
  //checks Accessibility in edit dialog
  it('checks accessibility in edit dialog', () => {
    cy.getVeoTestUnitCard(unitDetails.name).as('testUnitCard');
    cy.getCustom('@testUnitCard').within(() => {
      cy.getCustom('[data-veo-test="units-edit-unit-button"]').click();
    });
    cy.checkAxeViolations();
  });

 it('checks accessibility in delete unit dialog', () => {
   cy.getVeoTestUnitCard(unitDetails.name).as('testUnitCard');
    cy.getCustom('@testUnitCard').within(() => {
      cy.getCustom('[data-veo-test="units-delete-unit-button"]').click({ force: true });
    });
 
   cy.get('[data-veo-test="units-delete-dialog"]').should('be.visible');
    cy.checkAxeViolations();
  });

  // checks Accessibility in create unit cards
  it('checks accessibility during create unit flow', () => {
    cy.getCustom('[data-veo-test="create-unit-btn"]').click({ force: true });
    cy.getCustom('[data-veo-test="unit-details-card"]').as('detailsCard');

    cy.getCustom('@detailsCard').within(() => {
      cy.getCustom('input').type(testData.unitName);
      cy.getCustom('textarea').type(testData.unitDesc);
    });
    cy.checkAxeViolations();

    cy.getCustom('[data-veo-test="create-unit-next-btn"]').click({ force: true });
    // profile card
    cy.checkAxeViolations();
    cy.getCustom('[data-veo-test="profile-radio-btn-none"]');
    cy.getCustom('[data-veo-test="create-unit-next-btn"]').click({ force: true });
    // domain card
    cy.checkAxeViolations();
    cy.getCustom('[data-veo-test="item-card-slot-left"] .v-chip').as('domainButtons');
    cy.getCustom('[data-veo-test="create-unit-next-btn"]').click({ force: true });
    // summary card
    cy.checkAxeViolations();

    cy.goToUnitSelection();
  });
});
