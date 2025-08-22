declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setImpactValue: typeof setImpactValue;
      setImpactReason: typeof setImpactReason;
      verifyEffectiveValue: typeof verifyEffectiveValue;
    }
  }
}

export function setImpactValue(index: number, impact: string) {
  cy.getCustom('[data-veo-test="form-potentialImpacts"]').eq(index).scrollIntoView().should('be.visible').click();

  cy.get('.v-overlay-container .v-list').contains('.v-list-item-title', impact).should('be.visible').click();
}

export function setImpactReason(index: number, reason: string) {
  cy.getCustom('[data-veo-test="form-potentialImpactReasons"]').eq(index).scrollIntoView().should('be.visible').click();

  cy.get('.v-overlay-container .v-list').contains('.v-list-item-title', reason).should('be.visible').click();
}

export function verifyEffectiveValue(index: number, effect: string) {
  cy.getCustom('[data-veo-test="form-potentialImpactsEffective"]')
    .eq(index)
    .find('.v-field__input')
    .should('have.text', effect);
}

Cypress.Commands.add('setImpactValue', setImpactValue);
Cypress.Commands.add('setImpactReason', setImpactReason);
Cypress.Commands.add('verifyEffectiveValue', verifyEffectiveValue);
