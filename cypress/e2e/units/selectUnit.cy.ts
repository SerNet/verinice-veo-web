describe('Unit Selection Functionality', () => {
  before(() => {
    cy.login();
    cy.createUnit({ domainNames: ['IT-Grundschutz', 'DS-GVO'] });
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit();
    cy.handleLanguageBug();
  });

  after(() => {
    cy.deleteUnit();
  });

  it('should switch unit and verify unit selection', () => {
    const defaultUnitName = Cypress.env('unitDetails').name;
    cy.get('[data-component-name="unit-select"] span')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal(defaultUnitName);
        cy.get('[data-component-name="breadcrumbs"]').contains(defaultUnitName);
      });

    cy.selectUnitFromDropdown();

    cy.get('[data-component-name="unit-select"] span')
      .invoke('text')
      .then((newUnitText) => {
        expect(newUnitText.trim()).to.not.equal(defaultUnitName);
        cy.get('[data-component-name="breadcrumbs"]').contains(newUnitText);
      });
  });
});
