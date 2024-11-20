/// <reference types="cypress" />

import { UnitDetails } from '../support/setupHelpers';
import { TCYVeoUnitNames } from './domains';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      goToUnitSelection: typeof goToUnitSelection;
      selectUnit: typeof selectUnit;
      createUnit: typeof createUnit;
      deleteUnitGUI: typeof deleteUnit;
      deleteUnit: typeof deleteUnit;
      editUnit: typeof editUnit;
      goToUnitDashboard: typeof goToUnitDashboard;
      getVeoTestUnitCard: typeof getVeoTestUnitCard;
      selectUnitFromDropdown: typeof selectUnitFromDropdown;
    }
  }
}

const UNIT_ID_REGEX = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;

export function goToUnitSelection(): void {
  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units`).as('getUnits');
  cy.visit('/units');
  cy.wait(['@getUnits']).its('response.statusCode').should('eq', 200);
}

export function selectUnitFromDropdown(unitName?: string): void {
  cy.getCustom('[data-component-name="unit-select"] .v-autocomplete__menu-icon').click();
  cy.getCustom('[data-veo-test="unit-selection-nav-item"]').should('be.visible');
  cy.getCustom('[data-veo-test="unit-selection-nav-item"]').then(($els) => {
    const found = $els.toArray().find((el) => {
      const text = Cypress.$(el).text();
      return text.includes(unitName);
    });

    if (found) {
      cy.wrap(found).click();
    } else {
      cy.wrap($els[$els.length - 1]).click();
    }
  });
}

export function selectUnit(unitName: string): void {
  cy.getCustom('.v-card-title')
    .contains(unitName)
    .click()
    .then(() => {
      cy.getCustom('[data-component-name="domain-dashboard-page"]');
      cy.url().then((url) => {
        const segments = url.split('/');

        let unitId = null;
        for (const segment of segments) {
          if (segment.match(UNIT_ID_REGEX)) {
            unitId = segment;
            break;
          }
        }
        expect(unitId).to.match(UNIT_ID_REGEX);

        const unitDetails = {
          ...Cypress.env(unitName),
          unitId: unitId
        };
        Cypress.env(unitName, unitDetails);
      });
    });
}

export function editUnit({
  unitName = Cypress.env('unitDetails').name,
  unitDesc = Cypress.env('unitDetails').desc,
  domainNames = []
}: {
  unitName?: string;
  unitDesc?: string;
  domainNames?: string[];
} = {}): void {
  // Commands not chained,
  // because it would be unsafe: https://docs.cypress.io/api/commands/clear
  // Name
  cy.getCustom('.new-unit-form input').first().clear();
  cy.getCustom('.new-unit-form input').first().type(unitName);

  // Description
  cy.getCustom('.new-unit-form input').last().clear();
  cy.getCustom('.new-unit-form input').last().type(unitDesc);

  if (domainNames.length) chooseDomains(['DS-GVO']);

  // Submit
  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units/**`).as('updatedUnit');
  cy.getCustom('.v-card-actions button').last().click();
  cy.wait(['@updatedUnit'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 200);
}

export function createUnit({
  name,
  desc = Cypress.env('unitDetails').desc,
  domains: domainNames = Cypress.env('unitDetails').domains
}: UnitDetails): void {
  if (Cypress.env('debug')) {
    cy.log(name);
    cy.log(desc);
  }

  cy.getVeoDomains().then((allVeoDomains) => {
    // Get targetUris of domains the test unit will be associated with
    const domains = allVeoDomains
      .filter((domain) => domainNames.includes(domain.name as TCYVeoUnitNames))
      .map((filteredDomain) => ({ targetUri: filteredDomain.targetUri }));

    const requestOptions = {
      endpoint: 'units',
      method: 'POST',
      body: {
        name: name,
        description: desc,
        domains
      }
    };

    cy.veoRequest(requestOptions).then((response: any) => {
      // Store unit id and domainNames
      // to make them accessible in tests and other commands
      const unitDetails = {
        ...Cypress.env(name),
        name: name,
        unitId: response.body.resourceId,
        desc: desc,
        domains: allVeoDomains
          .filter((domain) => domainNames.includes(domain.name as TCYVeoUnitNames))
          .map((filteredDomain) => ({ name: filteredDomain.name, id: filteredDomain.id }))
      };

      if (Cypress.env('debug')) cy.log(unitDetails.name);
      Cypress.env(unitDetails.name, unitDetails);
    });
  });
}

export function deleteUnit(unitName: string): void {
  // Check if the cypress environment has an ID for the test unit
  if (!unitName) {
    if (Cypress.env('debug')) cy.log('Could not find test unit ID. Test unit cannot be deleted.');
    return;
  }

  cy.veoRequest({
    endpoint: `units/${Cypress.env(unitName).unitId}`,
    method: 'DELETE'
  }).then((response) => expect(response.status).to.equal(204));
}

export function deleteUnitGUI({ unitName = Cypress.env('unitDetails').name }: { unitName?: string } = {}): void {
  cy.goToUnitSelection();
  cy.getCustom('.v-card-title')
    .contains(unitName)
    .parent()
    .parent()
    .find('[data-veo-test="units-delete-unit-button"]')
    .click();

  // Get delete dialog
  cy.getCustom('[data-veo-test="units-delete-dialog"]').as('deleteDialog');

  // Set up a listener for API responses
  cy.intercept('DELETE', `${Cypress.env('veoApiUrl')}/units/**`).as('deleteUnit');

  // Request delete unit
  cy.getCustom('@deleteDialog')
    .find('input')
    .type(unitName)
    .get('@deleteDialog')
    .find('[data-veo-test="units-delete-dialog-btn-delete"]')
    .last()
    .click();

  // Wait for API response and assert
  cy.wait(['@deleteUnit'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 204);
}

export function goToUnitDashboard({ isStoringUnitID = true, unitName = Cypress.env('unitDetails').name } = {}) {
  cy.goToUnitSelection();

  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units/**`).as('getUnitForDashboard');
  cy.getCustom('.v-list-item--link').contains(unitName).parent().parent().click();
  cy.wait(['@getUnitForDashboard']).its('response.statusCode').should('eq', 200);

  if (!isStoringUnitID) return;

  // Store unit id to make it accessible in tests and other commands
  cy.url().then((url) => {
    const unitDetails = { ...Cypress.env('unitDetails'), unitId: url.split('/').at(3) };
    Cypress.env('unitDetails', unitDetails);
  });
}

function chooseDomains(domainNames: string[]) {
  // Choose domains
  cy.getCustom('.new-unit-form .v-list-item')
    .as('availableDomains')
    .then(($el) => {
      const numAvailableDomains = $el.length;

      if (numAvailableDomains > 1) {
        cy.getCustom('@availableDomains').click({ multiple: true });
        domainNames.forEach((domain) => cy.getCustom('@availableDomains').contains(domain).click());
      } else if (numAvailableDomains < domainNames.length) {
        cy.log('Domains:', domainNames);
        cy.getCustom('@availableDomains').then(($el) => cy.log($el.text()));
        throw new Error('Some of the choosen domains are not applicable');
      } else if (numAvailableDomains === 1 && domainNames.length === 1) {
        cy.getCustom('@availableDomains').contains(domainNames[0]);
      }
    });
}

export function getVeoTestUnitCard(unitName: string) {
  const url = `/${Cypress.env(unitName).unitId}/domains/`;
  const veoCardSelector = `a[data-veo-test="item-card-slot-center-link"][href^="${url}"]`;
  return cy.getCustom(veoCardSelector).parent().parent().parent();
}
