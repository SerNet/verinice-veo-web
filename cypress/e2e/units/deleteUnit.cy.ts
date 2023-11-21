before(() => {
  cy.login();
  cy.createUnit({name: 'CY-TEST-UNIT'});
});

it('deletes a unit', () => {
  cy.deleteUnit({unitName: 'CY-TEST-UNIT'});
});
