import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Domain Selection Functionality', () => {
  beforeEach(() => {
    unitDetails = generateUnitDetails('domains');
    cy.login();
    cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['IT-Grundschutz', 'DS-GVO'] });
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
    cy.handleLanguageBug();
  });

  after(() => cy.deleteUnit(unitDetails.name));

  const itgs_widgets = [
    { name: 'scope', numOfElements: 4 },
    { name: 'process', numOfElements: 2 },
    { name: 'asset', numOfElements: 7 },
    { name: 'person', numOfElements: 1 },
    { name: 'control', numOfElements: 5 },
    { name: 'incident', numOfElements: 1 },
    { name: 'document', numOfElements: 3 },
    { name: 'scenario', numOfElements: 1 }
  ];

  it('should switch to IT-Grundschutz domain and verify domain selection', () => {
    cy.selectDomain('IT-Grundschutz');

    cy.getCustom('[data-veo-test="domain-select"]')
      .invoke('attr', 'data-selected-domain')
      .then(($selectedDomain) => {
        expect($selectedDomain).to.equal('IT-Grundschutz');
        cy.getCustom('[data-component-name="breadcrumbs"]').should(
          'have.attr',
          'data-current-domain',
          'IT-Grundschutz'
        );
        cy.testEmptyDashboard(itgs_widgets);
      });
  });

  it('should switch to DS-GVO domain and verify domain selection', () => {
    cy.selectDomain('DS-GVO');

    cy.getCustom('[data-veo-test="domain-select"]')
      .invoke('attr', 'data-selected-domain')
      .then(($selectedDomain) => {
        expect($selectedDomain).to.equal('DS-GVO');
        cy.getCustom('[data-component-name="breadcrumbs"]').should('have.attr', 'data-current-domain', 'DS-GVO');
        cy.testEmptyDashboard();
      });
  });
});
