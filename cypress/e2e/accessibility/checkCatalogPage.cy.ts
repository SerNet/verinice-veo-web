import { setupVeo } from '../../commands/setup';

describe('Catalogs', () => {
  beforeEach(() => {
    setupVeo('Catalogs');
  });

  afterEach(() => {
    cy.deleteUnit();
  });
  it('checks Accessibility in catalog ', () => {
    // go to catalog page
    const dynamicTestData = Cypress.env('dynamicTestData');
    cy.visit(`/${dynamicTestData.unit?.unitId}/domains/${dynamicTestData.unit?.domains?.[0]?.id}/catalog`, {
      failOnStatusCode: false
    });

    cy.getCustom('.v-data-table__tr').should('be.visible');

    cy.checkAxeViolations();
  });

  // Wait for the dialog to open
  it('checks Accessibility in catalog dialog ', () => {
    const dynamicTestData = Cypress.env('dynamicTestData');

    cy.visit(`/${dynamicTestData.unit?.unitId}/domains/${dynamicTestData.unit?.domains?.[0]?.id}/catalog`, {
      failOnStatusCode: false
    });
    cy.getCustom('.v-data-table__tr').should('be.visible');
    cy.getCustom('.v-data-table__tr').first().click();
    cy.get('[data-veo-test="catalogs-btn-apply"]').click();

    // Wait for the dialog to open
    cy.get('[data-veo-test="catalog-dialog"]').should('be.visible');
    cy.checkAxeViolations('[data-veo-test="catalog-dialog"]');
  });
});
