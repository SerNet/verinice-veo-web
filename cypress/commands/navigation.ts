/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      navigateTo: typeof navigateTo;
      navigateToDeprecated: typeof navigateToDeprecated;
    }
  }
}

export function navigateToDeprecated(navigationList: string[]) {
  navigationList.forEach((navigator) => {
    cy.get('div[data-veo-test="objects-nav-item"]')
      .contains(new RegExp(`^${navigator}$`, 'i'))
      .scrollIntoView()
      .click({ force: true });
  });
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
