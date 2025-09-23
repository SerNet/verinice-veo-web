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

  afterEach(() => {
    cy.deleteUnit();
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

describe('Mitigation Measures', () => {
  beforeEach(() => {
    // Setup a unit with one module and pre-executed threat overview
    setupVeo('risks').then(() => {
      applyCatalogItem()
        .then(() => addModule())
        .then(() => executeThreatOverview());
    });
  });

  afterEach(() => {
    cy.deleteUnit();
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
