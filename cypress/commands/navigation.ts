/// <reference types="cypress" />

import { upperFirst } from 'lodash';

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
      cy.get(
        `[data-veo-test="nav-category-${group.toLowerCase().replace(/\s+/g, '-')}-${category.toLowerCase().replace(/\s+/g, '-')}"]`
      )
        .as('category')
        .click();
    });

    if (entry) {
      cy.get('@category').within(() => {
        cy.get(
          `[data-veo-test="nav-entry-${category.toLowerCase().replace(/\s+/g, '-')}-${entry.toLowerCase().replace(/\s+/g, '-')}"]`
        )
          .as('entry')
          .click();
      });
    }
    return;
  }

  cy.get('@group').within(() => {
    cy.get(
      `[data-veo-test="nav-entry-${group.toLowerCase().replace(/\s+/g, '-')}-${entry.toLowerCase().replace(/\s+/g, '-')}"]`
    )
      .as('entry')
      .click();
  });
}

export function iterateSubTypes(elementType: string, callback: (args: any) => void) {
  cy.contains('div[sub-group="true"] > div', new RegExp(`^${upperFirst(elementType)}$`))
    .should('be.visible')
    .parent()
    .find('a')
    .each(($subType) => {
      if ($subType.text() === 'All') return;
      callback($subType);
    });
}
