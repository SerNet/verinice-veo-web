// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    setImpactValue(index: number, impact: string): Chainable<Element>;

    checkImpactReason(index: number, reason: string): Chainable<Element>;

    verifyEffectiveValue(index: number, effect: string): Chainable<Element>;
  }
}

Cypress.Commands.add('setImpactValue', (index: number, impact: string) => {
  cy.getCustom('[data-veo-test="form-potentialImpacts"]').eq(index).click();
  cy.get('body').contains(impact).should('be.visible').click();
});

Cypress.Commands.add('checkImpactReason', (index: number, reason: string) => {
  cy.getCustom('[data-veo-test="form-potentialImpactReasons"]').eq(index).click();
  cy.get('body').contains(reason).should('be.visible').click();
});

Cypress.Commands.add('verifyEffectiveValue', (index: number, effect: string) => {
  cy.getCustom('[data-veo-test="form-potentialImpactsEffective"]')
    .eq(index)
    .find('.v-field__input')
    .should('have.text', effect);
});
