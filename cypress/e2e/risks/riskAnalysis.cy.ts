/*
 * verinice.veo web - Risk Analysis Tests
 */

import { setupVeo } from '../../commands/setup';
import { applyCatalogItem } from '../../requests/catalogs';
import { addModule, executeThreatOverview } from '../../requests/control-implementations';

describe('Threat Overview', () => {
  beforeEach(() => {
    // Setup a unit with a IT-GS domain and one module
    setupVeo('threatOverview').then(() => {
      applyCatalogItem().then(() => addModule());
    });
  });

  it('should generate threat overview', () => {
    cy.visitObject();

    // Click "More Actions" → "Threat Overview"
    cy.getCustom('[data-component-name="object-form-more-actions-button"]').click();
    cy.getCustom('[data-veo-test="action-selection-nav-item"]').contains('Draw up threat overview').click();

    cy.getCustom('[data-component-name="object-details-risks-tab"]').click();

    cy.getCustom('[data-veo-test="loadedDataTable"]')
      .should('be.visible')
      .find('tr')
      .its('length')
      .should('be.greaterThan', 0);
  });
});

describe('Net risk', () => {
  before(() => {
    setupVeo('netRisk').then(() => {
      applyCatalogItem()
        .then(() => addModule())
        .then(() => executeThreatOverview());
    });
  });

  it('should calculate net risk', () => {
    cy.visitObject();

    // Navigate to Risks tab
    cy.getCustom('[data-component-name="object-details-risks-tab"]').click();

    // Select the first risk row → opens dialog
    cy.getCustom('[data-veo-test="loadedDataTable"]:visible').should('be.visible').click();

    // Verify dialog is open
    cy.getCustom('[data-veo-test="base-dialog"]').should('be.visible');

    // Define type of risk treatment to activate net risk input
    cy.getCustom('[data-veo-test="risk-treatments"]').first().click();
    cy.get('div[role="listbox"]').contains('risk transfer').click();

    // Set Net risk to High
    cy.getCustom('[data-veo-test="residual-risk"]').first().click();
    cy.get('div[role="listbox"]').contains('High').click();

    // Save evaluation
    cy.getCustom('[data-veo-test="dialog-risk-save"]').should('be.visible').click();

    // Close dialog
    cy.getCustom('[data-veo-test="dialog-risk-close"]').should('be.visible').click();

    // Open the dialog again to check if change were saved
    cy.getCustom('[data-veo-test="loadedDataTable"]:visible').should('be.visible').click();

    // Check if the changes were made
    cy.get('[data-veo-test="risk-treatments"] span').first().should('have.text', 'risk transfer');
    cy.get('[data-veo-test="residual-risk"] span').first().should('have.text', 'High');
  });
});

describe('Mitigation Measures', () => {
  beforeEach(() => {
    setupVeo('risks').then(() => {
      applyCatalogItem()
        .then(() => addModule())
        .then(() => executeThreatOverview());
    });
  });

  it('should add a mitigation to a risk', () => {
    cy.visitObject();
    cy.getCustom('[data-component-name="object-details-risks-tab"]').click();

    // Open risk dialog
    cy.getCustom('[data-veo-test="loadedDataTable"]:visible ').should('be.visible').click();

    // Add mitigation
    cy.getCustom('[data-veo-test="add-mitigation"]').click();
    cy.contains('[data-veo-test="add-mitigating-actions"]', 'Add mitigating action').click();

    // Select the first item
    cy.getCustom('[data-veo-test="dialog-card"] tbody tr input').first().check();

    // Save mitigation in controls dialog
    cy.get('button').last().contains('Save').should('be.visible').click();

    // Save change in the risk dialog
    cy.getCustom('[data-veo-test="dialog-risk-save"]').should('be.visible').click();

    // Close dialog
    cy.getCustom('[data-veo-test="dialog-risk-close"]').should('be.visible').click();

    // Reopen dialog
    cy.getCustom('[data-veo-test="loadedDataTable"]:visible ').should('be.visible').click();

    // Confirm mitigation is added in the dialog table
    cy.getCustom('[data-veo-test="loadedDataTable"]:visible tr').should('be.visible');

    // Confirm the item is checked
    cy.getCustom('[data-veo-test="add-mitigation"]').click();
    cy.contains('[data-veo-test="add-mitigating-actions"]', 'Add mitigating action').click();
    cy.getCustom('[data-veo-test="dialog-card"] tbody tr input').first().should('be.checked');
  });
});
