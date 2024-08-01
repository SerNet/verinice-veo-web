/// <reference types="cypress" />

import { pluralizeElementType } from './utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      navigateTo: typeof navigateTo;
      iterateSubTypes: typeof iterateSubTypes;
    }
  }
}

export function navigateTo({ group, category, entry }: { group: string; category?: string; entry?: string }) {
  cy.handleLanguageBug();
  cy.viewport(2000, 1320);
  cy.get(`[data-veo-test="nav-group-${group.toLowerCase()}"]`).as('group').click();

  if (category) {
    cy.get('@group').within(() => {
      cy.get(`[data-veo-test="nav-category-${category.toLowerCase()}"]`).as('category').click();
    });

    if (entry) {
      cy.get('@category').within(() => {
        cy.get(`[data-veo-test="nav-entry-${entry.toLowerCase()}"]`).as('entry').click();
      });
    }
    return;
  }

  cy.get('@group').within(() => {
    cy.get(`[data-veo-test="nav-entry-${entry.toLowerCase()}"]`).as('entry').click();
  });
}

export function iterateSubTypes(elementType: string, callback: (args: any) => void) {
  const pluralizedElementType = pluralizeElementType(elementType);
  cy.contains('div[sub-group="true"] > div', new RegExp(`^${pluralizedElementType}$`))
    .should('be.visible')
    .parent()
    .find('a')
    .each(($subType) => {
      if ($subType.text() === 'All') return;
      callback($subType);
    });
}
