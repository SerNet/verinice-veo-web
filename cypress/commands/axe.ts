
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
        checkAxeViolations: typeof checkAxeViolations;
    }
  }
}

export const checkAxeViolations = (context: string | null = null) => {
  const A11Y_OPTIONS = {
    runOnly: {
      type: 'tag' as const,
      values: ['wcag21aa', 'wcag2aa'] //These are WCAG 2.0/2.1 Level AA rules.
    }
  };
  cy.injectAxe();

  //log the context being checked
  cy.log(`🔍 Checking accessibility for context: ${context || 'whole page'}`);

  cy.checkA11y(context, A11Y_OPTIONS, (violations) => {
    cy.log(`🛑 Found ${violations.length} accessibility violation(s)`);
    // log details for each violation
    violations.forEach((violation) => {
      cy.log(`--- Violation: ${violation.id} (${violation.impact}) ---`);
      cy.log(`Description: ${violation.description}`);
      cy.log(`Help: ${violation.help}`);
    });
  });
};
