/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      languageTo: typeof languageTo;
      handleLanguageBug: typeof handleLanguageBug;
    }
  }
}

export function languageTo(language: string) {
  cy.get('button[data-component-name="language-select"]').click();
  cy.get('div[role="listbox"] div').contains(language).click();
}

export const handleLanguageBug = () => {
  cy.get('nav[data-component-name="primary-navigation"]').then((body) => {
    if (body.find('div[data-component-name="objects-nav-item"]:contains("Objects")').length === 0) {
      cy.languageTo('English');
    }
  });
};
