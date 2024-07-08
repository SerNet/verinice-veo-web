/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      navigateTo: typeof navigateTo;
    }
  }
}

export function navigateTo({ group, category, entry }: { group: string; category?: string; entry?: string }) {
  cy.handleLanguageBug();
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
