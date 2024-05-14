describe('Apply Profiles', () => {
  before(() => {
    cy.login();
    cy.createUnit();
  });

  after(() => cy.deleteUnit());

  it('applies the DS-GVO demo profile to the test unit', () => {
    const profileName = 'Beispieldaten';
    const unitId = Cypress.env('unitDetails').unitId;
    const domainId = Cypress.env('unitDetails').domains[0].id;

    cy.log(JSON.stringify(Cypress.env('unitDetails')));

    // Per default test units are associated with the DS-GVO Domain
    cy.acceptAllCookies();
    cy.goToUnitSelection();
    cy.getVeoTestUnitCard().as('testUnitCard');

    // Go to profiles
    cy.get('@testUnitCard').within((_card) => {
      cy.get('[data-veo-test="apply-profiles-link"]').click();
    });

    // Get profile card
    cy.get(`[data-veo-test="profile-${profileName}"]`).as('profileCard');

    // Choose profile
    cy.get('@profileCard').find('[data-veo-test="profile-radio-btn-Beispieldaten"] input').click();

    // Apply profile
    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/profiles/**/incarnation?unit=**`).as('applyProfile');
    cy.get('[data-veo-test="apply-profile"]').click();
    cy.wait(['@applyProfile']).its('response.statusCode').should('eq', 204);

    // Check redirect to unit dashboard
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/${unitId}/domains/${domainId}`);

    cy.testDashboardWidgets();
  });
});
