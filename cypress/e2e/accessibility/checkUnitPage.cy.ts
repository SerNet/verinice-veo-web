import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

const testData = {
  unitName: `TEST-NAME-${Math.random()}`,
  unitDesc: 'TEST DESCRIPTION FROM `createUnit.cy.ts`',
  domains: ['DS-GVO', 'IT-Grundschutz'],
  domainSelectors: ['[data-veo-test="domain-card-checkbox-ds-gvo"]', '[data-veo-test="domain-card-checkbox-itgs"]']
};

describe('check Accessibility', () => {
  before(() => {
    unitDetails = generateUnitDetails('profiles');
    cy.login();
    cy.acceptAllCookies();
    cy.createUnit(unitDetails);
  });

  afterEach(() => cy.deleteUnit(unitDetails.name));

  it('check Accessibility in unit', () => {
    cy.goToUnitSelection();
    cy.getVeoTestUnitCard(unitDetails.name).as('testUnitCard');
    cy.checkAxeViolations();

    //check Accessibility in edit dialog
    cy.getCustom('@testUnitCard').within((_card) => {
      cy.getCustom('[data-veo-test="units-edit-unit-button"]').click();
    });
    cy.checkAxeViolations();
    cy.getCustom('[data-veo-test="cancel-dialog"]').click({ force: true });

    // check Accessibility in profiles
    cy.getCustom('@testUnitCard').within((_card) => {
      cy.getCustom('[data-veo-test="apply-profiles-link"]').click();
    });
    cy.checkAxeViolations();
    cy.getCustom('[data-veo-test="cancel-dialog"]').click({ force: true });

    // check Accessibility in create unit cards
    cy.getCustom('[data-veo-test="create-unit-btn"]').click({ force: true });
    cy.getCustom('[data-veo-test="unit-details-card"]').as('detailsCard');
    cy.getCustom('@detailsCard').within((_$card) => {
      cy.getCustom('input').type(testData.unitName);
      cy.getCustom('textarea').type(testData.unitDesc);
    });
    cy.checkAxeViolations();
    cy.getCustom('[data-veo-test="create-unit-next-btn"]').click({ force: true });
    // choose profile card
    cy.checkAxeViolations();
    cy.getCustom('[data-veo-test="profile-radio-btn-none"]');
    cy.getCustom('[data-veo-test="create-unit-next-btn"]').click({ force: true });
    // choose domain card
    cy.checkAxeViolations();
    cy.getCustom('[data-veo-test="item-card-slot-left"] .v-chip').as('domainButtons');
    cy.getCustom('[data-veo-test="create-unit-next-btn"]').click({ force: true });
    // summary card
    cy.checkAxeViolations();
    cy.goToUnitSelection();
  });
});
