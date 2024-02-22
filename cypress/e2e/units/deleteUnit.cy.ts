before(() => {
  cy.login();
  cy.createUnit();
});

it('deletes a unit', () => {
  cy.deleteUnitGUI();
});
