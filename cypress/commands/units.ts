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
      editUnit: typeof editUnit;
      goToUnitDashboard: typeof goToUnitDashboard;
      getVeoTestUnitCard: typeof getVeoTestUnitCard;
    }
  }
}

export function goToUnitSelection(): void {
  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units`).as('getUnits');
  cy.visit('/units');
  cy.wait(['@getUnits']).its('response.statusCode').should('eq', 200);
}

export function selectUnit({ unitName = Cypress.env('unitDetails').name }: { unitName?: string } = {}): void {
  cy.get('.v-card-title')
    .contains(unitName)
    .click()
    .then(() => {
      cy.url().then((url) => {
        const segments = url.split('/');

        let unitId = null;
        for (const segment of segments) {
          if (segment.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)) {
            unitId = segment;
            break;
          }
        }
        expect(unitId).to.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);

        const unitDetails = {
          ...Cypress.env('unitDetails'),
          unitId: unitId
        };
        Cypress.env('unitDetails', unitDetails);
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
  cy.get('.new-unit-form input').first().clear();
  cy.get('.new-unit-form input').first().type(unitName);

  // Description
  cy.get('.new-unit-form input').last().clear();
  cy.get('.new-unit-form input').last().type(unitDesc);

  if (domainNames.length) chooseDomains(['DS-GVO']);

  // Submit
  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units/**`).as('updatedUnit');
  cy.get('.v-card-actions button').last().click();
  cy.wait(['@updatedUnit'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 200);
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

    const waitForRequestMethod = Cypress.env('veoDomains') ? false : true;

    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/units`).as('createUnit');
    cy.veoRequest({
      url: '/api/units',
      method: 'POST',
      waitForRequestMethod,
      requestBody: {
        name: unitName,
        description: unitDesc,
        domains
      }
    }).then((data: any) => {
      // Store unit id and domainNames
      // to make them accessible in tests and other commands
      const unitDetails = {
        ...Cypress.env('unitDetails'),
        unitId: data.resourceId,
        domains: allVeoDomains
          .filter((domain) => domainNames.includes(domain.name as TCYVeoUnitNames))
          .map((filteredDomain) => ({ name: filteredDomain.name, id: filteredDomain.id }))
      };
      Cypress.env('unitDetails', unitDetails);
    });
    cy.wait(['@createUnit'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 201);
  });
}

export function deleteUnit(waitForRequestMethod = true): void {
  // Check if the cypress environment has an ID for the test unit
  if (!Cypress.env('unitDetails').unitId) {
    cy.log('Could not find test unit ID. Test unit cannot be deleted.');
    return;
  }

  cy.intercept('DELETE', `${Cypress.env('veoApiUrl')}/units/**`).as('deleteUnit');
  cy.veoRequest({
    url: `/api/units/${Cypress.env('unitDetails').unitId}`,
    method: 'DELETE',
    waitForRequestMethod
  });
  cy.wait(['@deleteUnit']).its('response.statusCode').should('eq', 204);
}

export function deleteUnitGUI({ unitName = Cypress.env('unitDetails').name }: { unitName?: string } = {}): void {
  cy.goToUnitSelection();
  cy.get('.v-card-title')
    .contains(unitName)
    .parent()
    .parent()
    .find('[data-veo-test="units-delete-unit-button"]')
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

export function goToUnitDashboard({ isStoringUnitID = true, unitName = Cypress.env('unitDetails').name } = {}) {
  cy.goToUnitSelection();

  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/units/**`).as('getUnitForDashboard');
  cy.get('.v-list-item--link').contains(unitName).parent().parent().click();
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
  cy.get('.new-unit-form .v-list-item')
    .as('availableDomains')
    .then(($el) => {
      const numAvailableDomains = $el.length;

      if (numAvailableDomains > 1) {
        cy.get('@availableDomains').click({ multiple: true });
        domainNames.forEach((domain) => cy.get('@availableDomains').contains(domain).click());
      } else if (numAvailableDomains < domainNames.length) {
        cy.log('Domains:', domainNames);
        cy.get('@availableDomains').then(($el) => cy.log($el.text()));
        throw new Error('Some of the choosen domains are not applicable');
      } else if (numAvailableDomains === 1 && domainNames.length === 1) {
        cy.get('@availableDomains').contains(domainNames[0]);
      }
    });
}

export function getVeoTestUnitCard() {
  const url = `/${Cypress.env('unitDetails').unitId}/domains/`;
  const veoCardSelector = `a[data-veo-test="item-card-slot-center-link"][href^="${url}"]`;
  return cy.get(veoCardSelector).parent().parent().parent();
}
