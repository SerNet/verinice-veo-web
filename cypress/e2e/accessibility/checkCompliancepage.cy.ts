import { visitRIList } from '../../commands/navigation';
import { setupVeo } from '../../commands/setup';
import { applyCatalogItem } from '../../requests/catalogs';
import { addModule } from '../../requests/control-implementations';

describe('Compliance', () => {
  beforeEach(() => {
    cy.injectAxe();
    // Setup API
    setupVeo('workWithRis').then(() => {
      applyCatalogItem();
      addModule();
    });
  });

  it('checks Accessibility in Compliance', () => {
    visitRIList();
    cy.checkAxeViolations();
    cy.getCustom('.v-data-table__tr').first().click();
    cy.checkAxeViolations();
  });
});
