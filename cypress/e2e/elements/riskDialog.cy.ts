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

  it('Should add a Scenario to an Element', () => {
    cy.getCustom('[data-component-name="object-details-risks-tab"]').first().click();
    cy.getCustom('[data-component-name="object-details-actions-button"]').click();
    cy.getCustom('.v-overlay__content').contains('Create risk').click();
    cy.getCustom('[data-veo-test="dialog-card"]').as('container');

    // Get the text of the parent row when clicking the checkbox
    cy.getCustom('@container').within(() => {
      cy.getCustom('[id^="checkbox-"]')
        .filter('[aria-disabled="false"]')
        .first()
        .then(($checkbox) => {
          // Traverse up to the parent <tr> and get the text
          const $parentRow = $checkbox.closest('tr');
          const selectedRiskText = $parentRow.find('td').eq(4).text().trim();
          // Click the checkbox and wrap the text value
          cy.wrap(selectedRiskText).as('selectedRiskText');
          cy.wrap($checkbox).click();
        });
    });

    // Intercept the POST request and wait for the response
    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/scopes/**/risks`).as('addRisk');
    cy.containsCustom('create risk').should('exist').click();
    cy.wait('@addRisk').its('response.statusCode').should('eq', 201);

    // Verify that the selected risk is added to the data table
    cy.getCustom('[data-veo-test="loadedDataTable"]').should('be.visible');
    cy.getCustom('.v-data-table__tr.v-data-table__tr--clickable').should('have.length.greaterThan', 0);

    // Check if the selected risk text is present in the added items
    cy.get('@selectedRiskText').then((selectedRiskText) => {
      cy.getCustom('.v-data-table__tr.v-data-table__tr--clickable').contains(selectedRiskText).should('exist');
    });
  });
});
