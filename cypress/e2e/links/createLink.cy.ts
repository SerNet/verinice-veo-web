import { getRandomString } from '../../commands/utils';
import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

before(() => {
  unitDetails = generateUnitDetails('createLink');
  cy.login();
  cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
});

beforeEach(() => {
  cy.login();
  cy.acceptAllCookies();
  cy.goToUnitSelection();
  cy.selectUnit(unitDetails.name);
});
after(() => cy.deleteUnit(unitDetails.name));

describe('Create Link in Object and Save', () => {
  it('Should create a link in an object and save', () => {
    cy.navigateTo({ group: 'objects', category: 'Scopes' });
    cy.selectFirstSubType('Scopes', ($subType: JQuery<HTMLElement>) => {
      cy.wrap($subType).click();
      cy.checkSubTypePage($subType.text().trim());
      cy.getCustom('.v-data-table__tr').first().click();
      cy.getCustom('div[data-attribute-name="scope_management"] input').scrollIntoView().click({ force: true });
      cy.getCustom('.v-overlay__content [data-veo-test="create-object-button"]').click();
      // Enter a random name and save
      const randomName = getRandomString();
      cy.getCustom('.v-overlay__content input[id="#/properties/name"]').type(randomName);
      cy.getCustom('.v-overlay__content').contains('Save').click();

      // Verify that the name is set in the scope management field
      cy.getCustom('div[data-attribute-name="scope_management"]').should('contain.text', randomName);

      // Intercept the save and get requests
      cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/**`).as('saveRequest');

      // Click save, then verify the requests
      cy.contains('Save').click();
      cy.wait('@saveRequest').its('response.statusCode').should('eq', 200);
      // Must wait for the page to refresh, TODO: Fix the FormIsDirty Behavior
      cy.wait(2000);
      // Confirm the name appears in scope management after save
      cy.getCustom('div[data-attribute-name="scope_management"]').should('contain.text', randomName);
    });
  });
});
