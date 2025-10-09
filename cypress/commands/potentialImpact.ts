declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setImpactValue: typeof setImpactValue;
    }
  }
}

export function setImpactValue(impact: string, index: number = 0) {
  cy.getCustom('[data-veo-test="form-potentialImpacts"]').eq(index).scrollIntoView().should('be.visible').click();

  cy.get('.v-overlay-container .v-list').contains('.v-list-item-title', impact).should('be.visible').click();
}

Cypress.Commands.add('setImpactValue', setImpactValue);
