before(() => {
  cy.login();
});

it.only('creates an empty unit and acquaints it with the DSG-VO domain', () => {
  cy.createUnit({
    domains: ['DS-GVO']
  });
});

after(() => {
  cy.deleteUnit();
});
