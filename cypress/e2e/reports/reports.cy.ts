import { setupVeo, objectDataDefaults } from '../../commands/setup';

const objectData = {
  ...objectDataDefaults,
  objectTypePlural: 'incidents',
  subType: 'INC_DataPrivacyIncident'
};

const reportListItem = 'Notification form for personal data breach';
const downloadsFolder = Cypress.config('downloadsFolder');

describe('Reports', () => {
  before(() => {
    setupVeo('Generate Reports', ['DS-GVO'], objectData);
  });

  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
    cy.visit(
      `/${Cypress.env('dynamicTestData').unit.unitId}/domains/${
        Cypress.env('dynamicTestData').unit.domains[0].id
      }/reports/dp-privacy-incident`,
      { failOnStatusCode: false }
    );
  });

  it('should check if the reports table contains data', () => {
    cy.get('tbody').should('be.visible').find('tr').should('exist');
  });

  it('should allow report generation and check if a PDF file was created', () => {
    cy.getCustom('.v-data-table__tbody input[type="checkbox"]').click();
    cy.get('[data-component-name="generate-report-button"]').should('be.visible').click();
    cy.readFile(`${downloadsFolder}/${reportListItem}.pdf`).should('exist');
  });
});
