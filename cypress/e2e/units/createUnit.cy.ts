
before(() => {
  cy.login();
});

it('creates an empty unit and acquaints it with the DSG-VO domain', () =>  {
  const testUnitDescription = 'CY-TEST-DESCRIPTION';
  const desiredDomains = ['DS-GVO'];
  cy.createUnit({
    name: 'CY-TEST-UNIT',
    description: testUnitDescription,
    desiredDomains
  });
});

after( ()=> {
  cy.deleteUnit({ unitName: 'CY-TEST-UNIT' });
});
