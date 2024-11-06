import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Apply Profiles', () => {
  before(() => {
    unitDetails = generateUnitDetails('profiles');
    cy.login();
    cy.createUnit(unitDetails);
  });

  after(() => cy.deleteUnit(unitDetails.name));

  it('applies the DS-GVO demo profile to the test unit', () => {
    const profileName = 'Beispieldaten';
    const unitId = Cypress.env(unitDetails.name).unitId;
    const domainId = Cypress.env(unitDetails.name).domains[0].id;

    cy.log(JSON.stringify(Cypress.env(unitDetails.name)));

    // Per default test units are associated with the DS-GVO Domain
    cy.acceptAllCookies();
    cy.goToUnitSelection();
    cy.getVeoTestUnitCard(unitDetails.name).as('testUnitCard');

    // Go to profiles
    cy.getCustom('@testUnitCard').within((_card) => {
      cy.getCustom('[data-veo-test="apply-profiles-link"]').click();
    });

    // Get profile card
    cy.getCustom(`[data-veo-test="profile-${profileName}"]`).as('profileCard');

    // Choose profile
    cy.getCustom('@profileCard').find('[data-veo-test="profile-radio-btn-Beispieldaten"] input').click();

    // Apply profile
    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/profiles/**/incarnation?unit=**`).as('applyProfile');
    cy.getCustom('[data-veo-test="apply-profile"]').click();
    cy.wait(['@applyProfile']).its('response.statusCode').should('eq', 204);

    // Check redirect to unit dashboard
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/${unitId}/domains/${domainId}`);

    cy.testDashboardWidgets();
  });
});
