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
  cy.getCustom('button[data-component-name="language-select"]').click();
  cy.getCustom('div[role="listbox"] div').contains(language).click();
}

export const handleLanguageBug = () => {
  cy.getCustom('nav[data-component-name="primary-navigation"]').then((body) => {
    if (body.find('div[data-component-name="objects-nav-item"]:contains("Objects")').length === 0) {
      cy.languageTo('English');
    }
  });
};
