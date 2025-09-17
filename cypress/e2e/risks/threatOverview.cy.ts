/*
 * verinice.veo web - Threat Overview Test
 */

import { setupVeo } from '../../commands/setup';
import { applyCatalogItem } from '../../requests/catalogs';
import { addModule } from '../../requests/control-implementations';

describe('Threat Overview', () => {
  // Setup a unit with a DS-GVO domain and one module before all tests
  before(() => {
    setupVeo('threatOverview').then(() => {
      applyCatalogItem().then(() => addModule());
    });
  });

  after(() => {
    cy.deleteUnit();
  });

  function createThreatOverview() {
    // Navigate to and open risk tab
    cy.visitObject();

    // Click "More Actions" and select "Threat Overview"
    cy.getCustom('[data-component-name="object-form-more-actions-button"]').click();
    cy.getCustom('[data-veo-test="action-selection-nav-item"]').contains('Draw up threat overview').click();
  }

  it('should generate threat overview for the object and verify if it is generated in the Risks tab', () => {
    createThreatOverview();

    //Navigate to Risks tab
    cy.getCustom('[data-component-name="object-details-risks-tab"]').click();

    // Verify that the table is visible and contains at least one row
    cy.getCustom('[data-veo-test="loadedDataTable"]')
      .should('be.visible')
      .find('tr')
      .its('length')
      .should('be.greaterThan', 0);
  });
});
