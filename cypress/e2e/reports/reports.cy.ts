import { setupVeo, objectDataDefaults } from '../../commands/setup';

const objectData = {
  ...objectDataDefaults,
  objectTypePlural: 'incidents',
  subType: 'INC_DataPrivacyIncident'
};

const downloadsFolder = Cypress.config('downloadsFolder');

describe('Reports', () => {
  beforeEach(() => {
    setupVeo('Generate Reports', ['DS-GVO'], objectData).then(() => {
      cy.login();
      cy.acceptAllCookies();
      cy.visit(
        `/${Cypress.env('dynamicTestData').unit.unitId}/domains/${
          Cypress.env('dynamicTestData').unit.domains[0].id
        }/reports`,
        { failOnStatusCode: false }
      );

      cy.get('[data-veo-test^="report-dp-privacy-incident"]').first().click();
    });
  });

  it('should check if the reports table contains data', () => {
    cy.get('tbody').should('be.visible').find('tr').should('exist');
  });

  it('should allow report generation and check if a PDF file was created', () => {
    cy.getCustom('.v-data-table__tbody').should('be.visible');
    cy.get('[data-veo-test="opened-report-card"]')
      .should('have.attr', 'data-report-filename')
      .then((reportName) => {
        expect(reportName, 'report filename').to.not.equal('');

        cy.get('.v-data-table__tbody')
          .find('tr')
          .first()
          .find('[data-component-name="generate-report-button"]')
          .click();

        cy.readFile(`${downloadsFolder}/${reportName}.pdf`).should('exist');
      });
  });
});
