import { visitRIList } from '../../commands/navigation';
import { setupVeo } from '../../commands/setup';
import { applyCatalogItem } from '../../requests/catalogs';
import { addModule } from '../../requests/control-implementations';

describe('Compliance', () => {
  beforeEach(() => {
    // Setup API
    setupVeo('workWithRis').then(() => {
      applyCatalogItem();
      addModule();
      cy.injectAxe();
    });
  });
  afterEach(() => {
    cy.deleteUnit();
  });
  // go to Compliance page and check it
  it('checks Accessibility in Compliance page', () => {
    visitRIList();
    cy.checkAxeViolations();
    cy.getCustom('.v-data-table__tr').first().click();
    cy.checkAxeViolations();
    cy.get('.v-card-actions button')
      .contains(/cancel/i)
      .click();
  });
});
