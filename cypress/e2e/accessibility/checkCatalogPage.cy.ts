import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Catalogs', () => {
  before(() => {
    unitDetails = generateUnitDetails('catalogs');
    cy.login();
    cy.createUnit(unitDetails);
    cy.acceptAllCookies();
    cy.injectAxe();
  });

  after(() => cy.deleteUnit(unitDetails.name));
  it('check Accessibility in catalog ', () => {
    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);

    // go to catalog page
    cy.navigateTo({ group: 'catalog', entry: 'all' });
    cy.getCustom('.v-data-table__tr').should('be.visible');

    cy.checkAxeViolations();
    cy.getCustom('.v-data-table__tr').first().click();
    cy.get('[data-veo-test="catalogs-btn-apply"]').click();

    // Wait for the dialog to open
    cy.get('[data-veo-test="catalog-dialog"]').should('be.visible');
    cy.checkAxeViolations();
  });
});
