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

  it('should set net risk', () => {
    cy.visitObject();

    // Navigate to Risks tab
    cy.getCustom('[data-component-name="object-details-risks-tab"]').click();

    // Select the first risk row → opens dialog
    cy.get('[data-veo-test="loadedDataTable"] tbody tr td span').first().click();

    // Verify dialog is open
    cy.getCustom('[data-veo-test="base-dialog"]').should('be.visible');

    // Needed to activate net risk
    cy.get('[data-test-selector="risk-treatments"]').contains('Risk treatment').click({ force: true });
    cy.get('div[role="listbox"]').contains('risk transfer').click();

    // Set Net risk to High
    cy.get('[data-test-selector="residual-risk"]').contains('Residual risk').click({ force: true });
    cy.get('div[role="listbox"]').contains('High').click();

    // Save evaluation
    cy.get('button').last().contains('Save').should('be.visible').click();

    // Check if the changes were made
    cy.get('[data-test-selector="risk-treatments"] span').should('have.text', 'risk transfer');
    cy.get('[data-test-selector="residual-risk"] span').should('have.text', 'High');
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

    cy.get('[data-veo-test="loadedDataTable"] tbody tr td span').first().click();

    cy.getCustom('[data-veo-test="add-mitigation"]').click();
    cy.contains('[data-veo-test="add-mitigating-actions"]', 'Add mitigating action').click();

    cy.getCustom('[data-veo-test="dialog-card"] tbody tr input').first().check();

    cy.get('button').last().contains('Save').should('be.visible').click();
  });
});
