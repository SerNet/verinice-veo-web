describe('Unit details', { testIsolation: false }, () => {
  before(() => {
    cy.login();
    cy.createUnit();
    cy.acceptAllCookies();
  });

  after(() => cy.deleteUnit());

  it.only('checks if unit details are displayed correctly', () => {
    cy.goToUnitSelection();

    // Get the test unit
    cy.getVeoTestUnitCard().as('testUnitCard');

    // Go to /details
    cy.get('@testUnitCard').find('[data-veo-test="units-edit-unit-button"]').click();
    cy.wait(2000);

    // Get details card
    cy.get('[data-veo-test="unit-details-card"]').as('detailsCard');

    // Assert
    // URL
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units/${Cypress.env('unitDetails').unitId}/details`);

    // Name and description
    cy.get('@detailsCard').within((_$card) => {
      cy.get('.v-card-title').contains(Cypress.env('unitDetails').name);

      /*
       * Check against value:
       * Vuetify seems to hava a mechanism that leaves the actual elements blank,
       * thus a check using `contains` will fail
       */
      cy.get('input').then(($input) => {
        expect($input[0].value).to.equal(Cypress.env('unitDetails').name);
      });
      cy.get('textarea').then(($textarea) => {
        expect($textarea[0].value).to.equal(Cypress.env('unitDetails').desc);
      });
    });
  });

  it('updates unit details', () => {
    const testData = {
      unitName: `TEST-NAME-${Math.random()}`,
      unitDesc: 'TEST DESCRIPTION'
    };

    // Go to details page of the test unit
    // cy.visit(`${Cypress.config('baseUrl')}/units/${Cypress.env('unitDetails').unitId}/details`); => does not yet work in pipelines
    cy.visit('/units');
    cy.getVeoTestUnitCard().as('testUnitCard');
    cy.get('@testUnitCard').within((_card) => {
      cy.get('[data-veo-test="units-edit-unit-button"]').click();
    });

    // Get details card
    cy.get('[data-veo-test="unit-details-card"]').as('detailsCard');

    // Update details
    cy.get('@detailsCard').within((_$card) => {
      cy.get('input').clear().type(testData.unitName);
      cy.get('textarea').clear().type(testData.unitDesc);
    });

    // Post new details
    cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/units/${Cypress.env('unitDetails').unitId}`).as(
      'updateUnitDetails'
    );
    cy.get('[data-veo-test="associate-domains"]').click();
    cy.wait('@updateUnitDetails').its('response.statusCode').should('eq', 200);

    // Test if redirect after updating unit details works as expected
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units`);

    // Test if unit card renders updated details
    cy.getVeoTestUnitCard().as('testUnitCard');
    cy.get('@testUnitCard').should('contain', testData.unitName);
    cy.get('@testUnitCard').should('contain', testData.unitDesc);
  });
});
