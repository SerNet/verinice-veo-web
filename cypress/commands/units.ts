/// <reference types="cypress" />

import { TCYVeoUnitNames } from './domains';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      goToUnitSelection: typeof goToUnitSelection;
      selectUnit: typeof selectUnit;
      createUnit: typeof createUnit;
      createUnitGUI: typeof createUnitGUI;
      deleteUnitGUI: typeof deleteUnit;
      deleteUnit: typeof deleteUnit;
    }
  }
}

export function goToUnitSelection(): void {
  cy.visit('/units');
  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units`).as('getUnits');
  cy.wait(['@getUnits']).its('response.statusCode').should('eq', 200);
}

export function selectUnit({ unitName = Cypress.env('unitDetails').name }: { unitName?: string } = {}): void {
  cy.get('[data-veo-test="unit-selection-available-units"] a').contains(unitName).click();
}

export function createUnitGUI({
  unitName = Cypress.env('unitDetails').name,
  unitDesc = Cypress.env('unitDetails').desc,
  domains = Cypress.env('unitDetails').domains
}: { unitName?: string; unitDesc?: string; domains?: string[] } = {}): void {
  cy.goToUnitSelection();
  cy.get('.veo-primary-action-fab button').click();

  // Choose domains
  cy.get('.new-unit-form .v-list-item')
    .as('availableDomains')
    .then(($el) => {
      const numAvailableDomains = $el.length;

      if (numAvailableDomains > 1) {
        cy.get('@availableDomains').click({ multiple: true });
        domains.forEach((domain) => cy.get('@availableDomains').contains(domain).click());
      } else if (numAvailableDomains < domains.length) {
        cy.log('Domains:', domains);
        cy.get('@availableDomains').then(($el) => cy.log($el.text()));
        throw new Error('Some of the choosen domains are not applicable');
      } else if (numAvailableDomains === 1 && domains.length === 1) {
        cy.get('@availableDomains').contains(domains[0]);
      }
    });

  // Create new unit
  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units/**`).as('getNewUnit');
  cy.get('.new-unit-form input')
    .first()
    .type(unitName)
    .get('.new-unit-form input')
    .last()
    .type(unitDesc)
    .get('.v-card-actions button')
    .last()
    .click();

  cy.wait(['@getNewUnit'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 200);
}

export function createUnit({
  unitName = Cypress.env('unitDetails').name,
  unitDesc = Cypress.env('unitDetails').desc,
  domainNames = Cypress.env('unitDetails').domains
}: {
  unitName?: string;
  unitDesc?: string;
  domainNames?: string[];
} = {}): void {
  cy.getVeoDomains().then((allVeoDomains) => {
    // Get targetUris of domains the test unit will be associated with
    const domains = allVeoDomains
      .filter((domain) => domainNames.includes(domain.name as TCYVeoUnitNames))
      .map((filteredDomain) => ({ targetUri: filteredDomain.targetUri }));

    cy.veoRequest({
      url: '/api/units',
      method: 'POST',
      requestBody: {
        name: unitName,
        description: unitDesc,
        domains
      }
    });
  });
}

export function deleteUnit(): void {
  cy.intercept('DELETE', `${Cypress.env('veoApiUrl')}/units/**`).as('deleteUnit');
  cy.veoRequest({
    url: `/api/units/${Cypress.env('unitDetails').unitId}`,
    method: 'DELETE'
  });
  cy.wait(['@deleteUnit'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 204);
}

export function deleteUnitGUI({ unitName = Cypress.env('unitDetails').name }: { unitName?: string } = {}): void {
  cy.goToUnitSelection();
  cy.get('.v-list-item--link')
    .contains(unitName)
    .parent()
    .parent()
    .find('[data-component-name="unit-selection-delete-unit-button"]')
    .click();

  // Get delete dialog
  cy.get('[data-veo-test="units-delete-dialog"]').as('deleteDialog');

  // Set up a listener for API responses
  cy.intercept('DELETE', `${Cypress.env('veoApiUrl')}/units/**`).as('deleteUnit');

  // Request delete unit
  cy.get('@deleteDialog')
    .find('input')
    .type(unitName)
    .get('@deleteDialog')
    .find('[data-veo-test="units-delete-dialog-btn-delete"]')
    .last()
    .click();

  // Wait for API response and assert
  cy.wait(['@deleteUnit'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 204);
}
