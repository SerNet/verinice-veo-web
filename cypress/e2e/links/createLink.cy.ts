import { getRandomString } from '../../commands/utils';
import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

function setup() {
  unitDetails = generateUnitDetails('createLink');
  cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
  cy.login();
  cy.acceptAllCookies();
}

describe('Create Link in Object and Save', () => {
  beforeEach(() => setup());
  afterEach(() => cy.deleteUnit(unitDetails.name));

  it('Should create a link in an object and save', () => {
    // Go to object overview
    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);
    cy.navigateTo({ group: 'objects', category: 'Scopes', entry: 'Controllers, Art. 4 Nr.7 GDPR' });

    // Open the first object
    cy.getCustom('.v-data-table__tr').first().click();

    // Open person input select
    cy.getCustom('div[data-attribute-name="scope_management"] input').scrollIntoView().click({ force: true });

    // Open create person dialog
    cy.getCustom('.v-overlay__content [data-veo-test="create-object-button"]').click();

    // In the now visible Dialog: enter a random name and save
    const randomName = getRandomString();
    cy.getCustom('.v-overlay__content input[id="#/properties/name"]').type(randomName);

    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/persons?**`).as('savePerson');
    cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**/persons/**`).as('getPerson');

    cy.getCustom('.v-overlay__content').contains('Save').click();
    cy.wait('@savePerson').its('response.statusCode').should('eq', 201);
    cy.wait('@getPerson').its('response.statusCode').should('eq', 200);

    // Verify that the name is set in the scope management field
    cy.getCustom('div[data-attribute-name="scope_management"]').should('contain.text', randomName);

    // Save the object
    cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/**`).as('saveRequest');
    cy.containsCustom('Save').click();
    cy.wait('@saveRequest').its('response.statusCode').should('eq', 200);

    // Must wait for the page to refresh, TODO: Fix the FormIsDirty Behavior
    cy.wait(2000);

    // Confirm the name appears in scope management after save
    cy.getCustom('div[data-attribute-name="scope_management"]').should('contain.text', randomName);
  });
});
