before(() => {
  cy.login();
});

it('creates an empty unit and acquaints it with the DSG-VO domain', () =>  {
  const testUnitName = 'CY-TEST-UNIT';
  const testUnitDescription = 'CY-TEST-DESCRIPTION';
  const desiredDomains = ['DS-GVO'];
  cy.goToUnitSelection();
  cy.acceptAllCookies();
  cy.createUnit({
    name: testUnitName,
    description: testUnitDescription,
    desiredDomains
  });
});
