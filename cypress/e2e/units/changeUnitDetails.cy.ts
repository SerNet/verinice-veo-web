import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Unit details', { testIsolation: false }, () => {
  before(() => {
    unitDetails = generateUnitDetails('changeUnitDetails');
    cy.login();
    cy.createUnit(unitDetails);
    cy.acceptAllCookies();
  });

  after(() => cy.deleteUnit(unitDetails.name));

  it('checks if unit details are displayed correctly', () => {
    cy.goToUnitSelection();

    // Get the test unit
    cy.getVeoTestUnitCard(unitDetails.name).as('testUnitCard');

    // Go to /details
    cy.getCustom('@testUnitCard').find('[data-veo-test="units-edit-unit-button"]').click();
    cy.wait(2000);

    // Get details card
    cy.getCustom('[data-veo-test="unit-details-card"]').as('detailsCard');

    // Assert
    // URL
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units/${Cypress.env(unitDetails.name).unitId}/details`);

    // Name and description
    cy.getCustom('@detailsCard').within((_$card) => {
      cy.getCustom('.v-card-title').contains(Cypress.env(unitDetails.name).name);

      /*
       * Check against value:
       * Vuetify seems to hava a mechanism that leaves the actual elements blank,
       * thus a check using `contains` will fail
       */
      cy.getCustom('input').then(($input) => {
        expect($input[0].value).to.equal(Cypress.env(unitDetails.name).name);
      });
      cy.getCustom('textarea').then(($textarea) => {
        expect($textarea[0].value).to.equal(Cypress.env(unitDetails.name).desc);
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
    cy.getVeoTestUnitCard(unitDetails.name).as('testUnitCard');
    cy.getCustom('@testUnitCard').within((_card) => {
      cy.getCustom('[data-veo-test="units-edit-unit-button"]').click();
    });

    // Get details card
    cy.getCustom('[data-veo-test="unit-details-card"]').as('detailsCard');

    // Update details
    cy.getCustom('@detailsCard').within((_$card) => {
      cy.getCustom('input').clear().type(testData.unitName);
      cy.getCustom('textarea').clear().type(testData.unitDesc);
    });

    // Post new details
    cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/units/${Cypress.env(unitDetails.name).unitId}`).as(
      'updateUnitDetails'
    );
    cy.getCustom('[data-veo-test="associate-domains"]').click();
    cy.wait('@updateUnitDetails').its('response.statusCode').should('eq', 200);

    // Test if redirect after updating unit details works as expected
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units`);

    // Test if unit card renders updated details
    cy.getVeoTestUnitCard(unitDetails.name).as('testUnitCard');
    cy.getCustom('@testUnitCard').should('contain', testData.unitName);
    cy.getCustom('@testUnitCard').should('contain', testData.unitDesc);
  });
});
