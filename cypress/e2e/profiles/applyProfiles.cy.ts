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
    cy.get('@profileCard').find('[data-veo-test="profile-radio-btn"] input').click();

    // Apply profile
    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/profiles/**/incarnation?unit=**`).as('applyProfile');
    cy.get('[data-veo-test="apply-profile"]').click();
    cy.wait(['@applyProfile'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 204);

    // Check redirect to unit dashboard
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/${unitId}/domains/${domainId}`);

    // Test if widgets contain the assumed number of canvas elements
    // (Canvas is used to draw charts if elements/objects exist,
    // otherwise a regular div is used)
    const widgets = [
      { name: 'scope', numOfElements: 5 },
      { name: 'process', numOfElements: 3 },
      { name: 'asset', numOfElements: 3 },
      { name: 'person', numOfElements: 2 },
      { name: 'control', numOfElements: 1 },
      { name: 'incident', numOfElements: 1 },
      { name: 'document', numOfElements: 3 },
      { name: 'scenario', numOfElements: 1 }
    ];

    widgets.forEach((widget) => {
      cy.get(`[data-veo-test="domain-dashboard-${widget.name}-widget"]`).as('widget');
      cy.get('@widget').within((_w) => {
        cy.get('canvas').should('have.length', widget.numOfElements);
      });
    });
  });
});
