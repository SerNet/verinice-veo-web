describe('Domain Selection Functionality', () => {
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

  const itgs_widgets = [
    { name: 'scope', numOfElements: 4 },
    { name: 'process', numOfElements: 2 },
    { name: 'asset', numOfElements: 7 },
    { name: 'person', numOfElements: 1 },
    { name: 'control', numOfElements: 6 },
    { name: 'incident', numOfElements: 1 },
    { name: 'document', numOfElements: 3 },
    { name: 'scenario', numOfElements: 1 }
  ];

  it('should switch domain and verify domain selection', () => {
    cy.selectDomain('IT-Grundschutz');

    cy.get('[data-veo-test="domain-select"] span')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('IT-Grundschutz');
        cy.get('[data-component-name="breadcrumbs"]').contains('ITGS');
        cy.testEmptyDashboard(itgs_widgets);
      });

    cy.selectDomain('DS-GVO');

    cy.get('[data-veo-test="domain-select"] span')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('DS-GVO');
        cy.get('[data-component-name="breadcrumbs"]').contains('DS-GVO');
        cy.testEmptyDashboard();
      });
  });
});
