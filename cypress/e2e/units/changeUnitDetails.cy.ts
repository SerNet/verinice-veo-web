import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

function setup() {
  const unitDetails = generateUnitDetails('workWithRis');
  cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['IT-Grundschutz'] });
  cy.login();
  cy.acceptAllCookies();
}

describe('Unit details', () => {
  beforeEach(() => {
    setup();
  });

  afterEach(() => cy.deleteUnit(Cypress.env('dynamicTestData').unit));

  it('checks if unit details are displayed correctly', () => {
    const testUnit = Cypress.env('dynamicTestData').unit;

    cy.goToUnitSelection();
    cy.getVeoTestUnitCard(testUnit).as('testUnitCard');

    // Click edit unit button
    cy.getCustom('@testUnitCard').find('[data-veo-test="units-edit-unit-button"]').click();
    cy.wait(2000);

    // Get details card
    cy.getCustom('[data-veo-test="unit-details-card"]').as('detailsCard');

    // Assert
    // URL
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units/${testUnit.unitId}/details`);

    // Name and description
    cy.getCustom('@detailsCard').within((_$card: JQuery<HTMLElement>) => {
      cy.getCustom('.v-card-title').contains(testUnit.name);

      /*
       * Check against value:
       * Vuetify seems to hava a mechanism that leaves the actual elements blank,
       * thus a check using `contains` will fail
       */
      cy.getCustom('input').then(($input: JQuery<HTMLInputElement>) => {
        expect($input[0].value).to.equal(testUnit.name);
      });
      cy.getCustom('textarea').then(($textarea: JQuery<HTMLInputElement>) => {
        expect($textarea[0].value).to.equal(testUnit.desc);
      });
    });
  });

  it('updates unit details', () => {
    const testUnit = Cypress.env('dynamicTestData').unit;
    const testData = {
      unitName: `TEST-NAME-${Math.random()}`,
      unitDesc: 'TEST DESCRIPTION'
    };

    // Get test unit card + click edit button
    cy.goToUnitSelection();
    cy.getVeoTestUnitCard(testUnit).as('testUnitCard');
    cy.getCustom('@testUnitCard').within((_card: JQuery<HTMLElement>) => {
      cy.getCustom('[data-veo-test="units-edit-unit-button"]').click();
    });

    // Get details card
    cy.getCustom('[data-veo-test="unit-details-card"]').as('detailsCard');

    // Update details
    cy.getCustom('@detailsCard').within((_$card: JQuery<HTMLElement>) => {
      cy.getCustom('input').clear().type(testData.unitName);
      cy.getCustom('textarea').clear().type(testData.unitDesc);
    });

    // Intercept posting new unit details
    cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/units/${testUnit.unitId}`).as('updateUnitDetails');
    // Intercept unit reloading
    cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units`).as('getUnits');

    // Post new details
    cy.getCustom('[data-veo-test="associate-domains"]').click();

    // Wait for the magic to happen
    cy.wait('@updateUnitDetails').its('response.statusCode').should('eq', 200);
    cy.wait(['@getUnits']).its('response.statusCode').should('eq', 200);

    // Test if app redirected to /units after updating unit details
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units`);

    // Test if unit card actually renders updated details
    cy.getVeoTestUnitCard(testUnit).as('testUnitCard');
    cy.getCustom('@testUnitCard').should('contain', testData.unitName);
    cy.getCustom('@testUnitCard').should('contain', testData.unitDesc);
  });
});
