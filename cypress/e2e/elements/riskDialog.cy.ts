import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

before(() => {
  unitDetails = generateUnitDetails('copyElements');
  cy.login();
  cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
});

beforeEach(() => {
  cy.login();
  cy.acceptAllCookies();
  cy.goToUnitSelection();
  cy.selectUnit(unitDetails.name);
  cy.navigateTo({ group: 'objects', category: 'scopes' });
  cy.selectFirstSubType('scopes', ($subType: JQuery<HTMLElement>) => {
    cy.wrap($subType).click();
    cy.checkSubTypePage($subType[0].innerText);
    cy.getCustom('.v-data-table__tr').first().click();
  });
});
after(() => cy.deleteUnit(unitDetails.name));

describe('Risk Dialog', { testIsolation: false }, () => {
  it('should set a Risk Definition to an Element', () => {
    cy.getCustom('[data-component-name="object-details-risks-tab"]').should('have.attr', 'disabled');
    cy.getCustom('input[id="#/properties/riskDefinition"]').scrollIntoView().click();
    cy.getCustom('.v-overlay-container').contains('DSRA').click();
    cy.containsCustom('Save').click();
    cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/domains/**`).as('editElement');
    cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**`).as('getElements');
    cy.containsCustom('Save').click();
    cy.wait(['@editElement', '@getElements']).then((intercepts) => {
      expect(intercepts[0].response.statusCode).to.equal(200);
      expect(intercepts[1].response.statusCode).to.equal(200);
    });
    cy.wait(1000);
    cy.getCustom('[data-component-name="object-details-risks-tab"]').first().should('not.have.attr', 'disabled');
  });
});
