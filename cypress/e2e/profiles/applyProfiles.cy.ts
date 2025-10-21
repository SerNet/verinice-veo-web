describe('Apply Profiles', () => {
  beforeEach(() => {
    cy.setupVeo('profiles', ['DS-GVO']);
  });

  it('applies the DS-GVO demo profile to the test unit', () => {
    const profileName = 'Beispieldaten';
    const testUnit = Cypress.env('dynamicTestData').testUnits[0];

    // Per default test units are associated with the DS-GVO Domain
    cy.acceptAllCookies();
    cy.goToUnitSelection();
    cy.getVeoTestUnitCard(testUnit.name).as('testUnitCard');

    // Go to profiles
    cy.getCustom('@testUnitCard').within((_card: JQuery<HTMLElement>) => {
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
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/${testUnit.unitId}/domains/${testUnit.domains[0].id}`);

    cy.testDashboardWidgets();
  });
});
