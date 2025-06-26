import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Catalogs', () => {
  beforeEach(() => {
    unitDetails = generateUnitDetails('catalogs');
    cy.login();
    cy.createUnit(unitDetails);

    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);
    cy.acceptAllCookies();
    cy.injectAxe();
  });

  afterEach(() => cy.deleteUnit(unitDetails.name));
  it('checks Accessibility in catalog ', () => {
    // go to catalog page
    cy.url().then((fullUrl) => {
      const url = new URL(fullUrl);
      cy.visit(`${url.pathname}/catalog`, { failOnStatusCode: false });
    });
    cy.getCustom('.v-data-table__tr').should('be.visible');

    cy.checkAxeViolations();
  });

  // Wait for the dialog to open
  it('checks Accessibility in catalog dialog ', () => {
    cy.url().then((fullUrl) => {
      const url = new URL(fullUrl);
      cy.visit(`${url.pathname}/catalog`, { failOnStatusCode: false });
    });
    cy.getCustom('.v-data-table__tr').should('be.visible');
    cy.getCustom('.v-data-table__tr').first().click();
    cy.get('[data-veo-test="catalogs-btn-apply"]').click();

    // Wait for the dialog to open
    cy.get('[data-veo-test="catalog-dialog"]').should('be.visible');
    cy.checkAxeViolations('[data-veo-test="catalog-dialog"]');
  });
});
