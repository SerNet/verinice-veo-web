before(() => {
  const testUser = Cypress.env('testUserDSGVO');
  cy.login({username: testUser.name, password: testUser.pw});
});

it('deletes the test unit', () => {
  const testUnitName = 'CY-TEST-UNIT';
  cy.goToUnitSelection();
  cy.acceptAllCookies();
  cy.deleteUnit({unitName: testUnitName});
});
