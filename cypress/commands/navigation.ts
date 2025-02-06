/// <reference types="cypress" />

import { upperFirst } from 'lodash';
import { waitForLoadersToDisappear } from './utils';

import type { UnitDetails } from '../support/setupHelpers';
import type { ICYVeoDomain } from './domains';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      navigateTo: typeof navigateTo;
      selectFirstSubType: typeof selectFirstSubType;
      visitObject: typeof visitObject;
      visitDashboard: typeof visitDashboard;
    }
  }
}

export function navigateTo({ group, category, entry }: { group: string; category?: string; entry?: string }) {
  cy.handleLanguageBug();
  cy.viewport(2000, 1320);
  cy.getCustom(`[data-veo-test="nav-group-${group.toLowerCase()}"]`).as('group').click();

  if (category) {
    cy.getCustom('@group').within(() => {
      cy.getCustom(
        `[data-veo-test="nav-category-${group.toLowerCase().replace(/\s+/g, '-')}-${category.toLowerCase().replace(/\s+/g, '-')}"]`
      )
        .as('category')
        .click();
    });

    if (entry) {
      cy.getCustom('@category').within(() => {
        cy.getCustom(
          `[data-veo-test="nav-entry-${category.toLowerCase().replace(/\s+/g, '-')}-${entry.toLowerCase().replace(/\s+/g, '-')}"]`
        )
          .as('entry')
          .click();
      });
    }
    return;
  }

  cy.getCustom('@group').within(() => {
    cy.getCustom(
      `[data-veo-test="nav-entry-${group.toLowerCase().replace(/\s+/g, '-')}-${entry.toLowerCase().replace(/\s+/g, '-')}"]`
    )
      .as('entry')
      .click();
  });
}

export function selectFirstSubType(elementType: string, callback: (args: any) => void) {
  cy.containsCustom('div[sub-group="true"] > div', new RegExp(`^${upperFirst(elementType)}$`))
    .should('be.visible')
    .parent()
    .find('a')
    .filter((index, $subType) => $subType.innerText !== 'All')
    .first()
    .then(($subType) => {
      if ($subType.length) {
        callback($subType);
      }
    });
}

export function visitObject(
  { unitId, domainId, objectType, subType, objectId } = {
    unitId: Cypress.env('dynamicTestData').unit.unitId,
    domainId: Cypress.env('dynamicTestData').unit.domains[0].id,
    objectType: Cypress.env('dynamicTestData').testObject.objectTypePlural,
    subType: Cypress.env('dynamicTestData').testObject.subType,
    objectId: Cypress.env('dynamicTestData').testObject.id
  }
) {
  // `failOnStatusCode: false` -> otherwise this code fails in gitlab pipelines
  cy.visit(`/${unitId}/domains/${domainId}/${objectType}/${subType}/${objectId}`, { failOnStatusCode: false });
  cy.get('[data-component-name="breadcrumbs"]', { timeout: 30000 }); // loading an object might take a long time...
  waitForLoadersToDisappear();
}

export function visitRIList(
  { unitId, domainId, targetObjectSubType, targetObjectId, controlImplementationId } = {
    unitId: Cypress.env('dynamicTestData').unit.unitId,
    domainId: Cypress.env('dynamicTestData').unit.domains[0].id,
    targetObjectSubType: Cypress.env('dynamicTestData').testObject.objectType,
    targetObjectId: Cypress.env('dynamicTestData').testObject.id,
    controlImplementationId: Cypress.env('dynamicTestData').modules[0].id
  }
) {
  cy.visit(
    `/${unitId}/domains/${domainId}/compliance?type=${targetObjectSubType}&targetObject=${targetObjectId}&control=${controlImplementationId}`,
    { failOnStatusCode: false }
  );
  cy.get('[data-component-name="breadcrumbs"]', { timeout: 30000 }); // loading an list of requirement implementations might take a long time...
}

export function visitEditor(
  { unitId, domainId } = {
    unitId: Cypress.env('dynamicTestData').unit.unitId,
    domainId: Cypress.env('dynamicTestData').unit.domains[0].id
  }
) {
  cy.visit(`/${unitId}/domains/${domainId}/editor`, { failOnStatusCode: false });
  cy.get('[data-component-name="breadcrumbs"]', { timeout: 30000 }); // loading an editor might take a long time...
  cy.handleLanguageBug();
}

export function visitDashboard({
  unitName = Cypress.env('dynamicTestData').testUnits[0].name,
  domainName = Cypress.env('dynamicTestData').testUnits[0].domains[0].name
} = {}) {
  const unit = Cypress.env('dynamicTestData').testUnits.find((u: UnitDetails) => u.name == unitName);
  const unitId = unit.unitId;
  const domainId = unit.domains.find((d: ICYVeoDomain) => (d.name = domainName)).id;

  // Go to dashboard
  cy.visit(`/${unitId}/domains/${domainId}`, { failOnStatusCode: false });

  // Wait for dashboard to render
  cy.getCustom('[data-component-name="breadcrumbs"]');
}
