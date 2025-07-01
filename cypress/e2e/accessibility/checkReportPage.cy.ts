import { setupAxeVeo } from '../../commands/setup';

describe('Report', () => {
  beforeEach(() => {
    setupAxeVeo('Report');
  });
  afterEach(() => {
    cy.deleteUnit();
  });
  // We skip this test because it's used elsewhere
  it.skip('checks Accessibility in Report page', () => {
    // go to report page
    const dynamicTestData = Cypress.env('dynamicTestData');
    cy.visit(
      `/${dynamicTestData.unit?.unitId}/domains/${dynamicTestData.unit?.domains?.[0]?.id}/reports/dp-privacy-incident`,
      { failOnStatusCode: false }
    );
    cy.getCustom('.v-data-table').should('be.visible');
    cy.checkAxeViolations();
  });
});
