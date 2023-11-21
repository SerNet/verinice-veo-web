before(() => {
  cy.login();
});

it('deletes a unit', () => {
  cy.deleteUnit({unitName: 'CY-TEST-UNIT'});
});
