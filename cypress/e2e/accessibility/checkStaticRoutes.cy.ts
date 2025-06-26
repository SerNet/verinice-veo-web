import { checkAxeViolations } from '../../commands/axe';

describe('checks Accessibility', () => {
  const routesToTest = ['/', '/user-data', '/welcome', '/security'];

  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
  });

  routesToTest.forEach((route) => {
    it(`checks accessibility violations on ${route}`, () => {
      cy.visit(route);
      cy.injectAxe();
      checkAxeViolations();
    });
  });
});
