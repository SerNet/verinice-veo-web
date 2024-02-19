before(() => {
  cy.login();
  cy.acceptAllCookies();
});

it.only('creates an empty unit and acquaints it with the GDPR domain', () => {
  cy.createUnitGUI({
    domains: ['DS-GVO']
  });
});

after(() => {
  cy.deleteUnit();
});
