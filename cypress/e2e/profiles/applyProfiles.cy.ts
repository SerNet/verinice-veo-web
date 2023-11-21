describe('Apply Profiles', () => {
  before(() => {
    cy.login();
    cy.createUnit({name: 'CY-TEST-UNIT'});
  });

  after(() => cy.deleteUnit({unitName: 'CY-TEST-UNIT'}));

  it('applies the DS-GVO demo profile to the test unit', () => {
    const profileName = 'Beispieldaten';

    // Per default test units are associated with the DS-GVO Domain
    cy.goToUnitSelection();
    cy.selectUnit({ name: 'CY-TEST-UNIT' });

    // Go to /profiles
    cy.get('[data-veo-test="profiles-nav-item"]').click();
    // Select Profile
    // get table row containing given profileName
    cy.get('.v-data-table__tr').contains(profileName).parent().as('checkboxParent');
    // select checkbox in that row
    cy.get('@checkboxParent').within(() => cy.get('[type="checkbox"]').click());

    // Select a unit to which the profile will be applied
    cy.get('[data-veo-test="profiles-btn-apply"]').click();

    cy.get('[role="dialog"] .v-card input').eq(2).type('CY-TEST-UNIT').type('{upArrow}');
    cy.get('.v-autocomplete__content .v-list-item').click();

    // Set up a listener for API responses
    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/profiles/demoUnit/units/**`).as('applyProfile');
    cy.get('.v-card-actions button').last().click();

    // Wait for API response
    cy.wait(['@applyProfile'], { responseTimeout: 15000 })
      .its('response.statusCode').should('eq', 204);
  });
});
