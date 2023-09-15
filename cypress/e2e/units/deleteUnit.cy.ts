before(() => {
  cy.login({});
});

it('deletes the test unit', () => {
  const testUnitName = 'CY-TEST-UNIT';
  cy.goToUnitSelection();
  cy.acceptAllCookies();
  cy.deleteUnit({unitName: testUnitName});
});
