/// <reference types="cypress" />

import { upperFirst } from 'lodash';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      navigateTo: typeof navigateTo;
      selectFirstSubType: typeof selectFirstSubType;
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
