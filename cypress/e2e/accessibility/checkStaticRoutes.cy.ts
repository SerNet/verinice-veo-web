import { checkAxeViolations } from '../../commands/axe';

describe('checkAxe', () => {
  const routesToTest = ['/', '/units', '/user-data', '/welcome', '/security'];

  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
  });

  routesToTest.forEach((route) => {
    it(`check accessibility violations on ${route}`, () => {
      cy.visit(route);
      cy.injectAxe();
      checkAxeViolations();
    });
  });
});
