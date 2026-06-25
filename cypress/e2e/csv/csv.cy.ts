const downloadsFolder = Cypress.config('downloadsFolder');
const csvFileName = 'Importfile.csv';
const importedObjectName = 'Sample text';

describe('CSV Import', () => {
  beforeEach(() => {
    cy.setupVeo('CSV Import', ['DS-GVO']).then(() => {
      const unitId = Cypress.env('dynamicTestData').testUnits[0].unitId;
      const domainId = Cypress.env('dynamicTestData').testUnits[0].domains.find((d) => d.name === 'DS-GVO').id;
      const objectType = Cypress.env('dynamicTestData').testObject.objectTypePlural;
      const subType = Cypress.env('dynamicTestData').testObject.subType;

      cy.visit(`${unitId}/domains/${domainId}/${objectType}/${subType}`, { failOnStatusCode: false });
    });
  });

  function openCsvImportDialog() {
    cy.get('[data-veo-test="csv-button"]').should('be.visible').click();

    cy.get('[data-veo-test="csv-dialog-card"]').should('be.visible');
  }

  function downloadCsvTemplate() {
    const subType = Cypress.env('dynamicTestData').testObject.subType;
    const subtypeLabel = subType.split('_')[1];

    cy.get('[data-veo-test="csv-download-button"]').should('be.visible').click();

    cy.contains('[data-veo-test="action-selection-nav-item"]', subtypeLabel).should('be.visible').click();

    return cy.wrap(`scope_${subtypeLabel}.csv`);
  }

  function verifyDownloadedFile(fileName: string) {
    cy.readFile(`${downloadsFolder}/${fileName}`).should('exist');
  }

  function uploadCsv(fileName: string) {
    cy.readFile(`cypress/fixtures/csv/${fileName}`).should('exist');

    cy.get('[data-veo-test="csv-dialog-card"]')
      .find('input[type="file"]')
      .selectFile(`cypress/fixtures/csv/${fileName}`, {
        force: true
      });

    cy.get('[data-veo-test="encoding-dialog"]').should('be.visible');

    cy.get('[data-veo-test="confirm-encoding-button"]').click();
  }

  function verifyObjectType() {
    const expectedObjectType = Cypress.env('dynamicTestData').testObject.objectType;
    const subType = Cypress.env('dynamicTestData').testObject.subType;
    const expectedObjectSubType = subType.split('_')[1];

    cy.get('[data-veo-test="object-type-select"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.toLowerCase()).to.contain(expectedObjectType.toLowerCase());
      });

    cy.get('[data-veo-test="object-subtype-select"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.toLowerCase()).to.contain(expectedObjectSubType.toLowerCase());
      });
  }

  function selectStatus() {
    cy.get('[data-veo-test^="status-select"]').should('be.visible').click();

    cy.get('[role="listbox"]').should('be.visible').click();
  }

  function mapColumns() {
    cy.get('[data-veo-test="column-name"]').each(($columnName, index) => {
      const columnName = $columnName.text().split('_')[0].trim();
      const optionName = columnName.charAt(0).toUpperCase() + columnName.slice(1);

      cy.get('[data-veo-test="column-mapping-select"]').eq(index).click();

      cy.get('[role="listbox"]').should('be.visible').contains(optionName).click();
    });
  }

  function importCsv() {
    cy.get('[data-veo-test="import-button"]').should('be.visible').should('not.be.disabled').click();
  }

  function verifyImportedObject(importedObjectName: string) {
    cy.contains('.v-data-table__tbody tr', importedObjectName).should('be.visible');
  }

  it('should open csv import dialog and download csv-file', () => {
    openCsvImportDialog();
    downloadCsvTemplate().then((fileName) => {
      verifyDownloadedFile(fileName);
    });
  });

  it('should import csv-file', () => {
    openCsvImportDialog();
    uploadCsv(csvFileName);
    verifyObjectType();
    selectStatus();
    mapColumns();
    importCsv();
    verifyImportedObject(importedObjectName);
  });
});
