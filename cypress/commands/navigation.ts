/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      navigation: typeof navigation;
    }
  }
}

export function navigation(navigationList: string[]) {
  navigationList.forEach((navigator) => {
    cy.get('div[data-component-name="objects-nav-item"]')
      .contains(new RegExp(`^${navigator}$`))
      .scrollIntoView()
      .click({ force: true });
  });
}
