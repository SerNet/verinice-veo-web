import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Domain Selection Functionality', () => {
  before(() => {
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
    { name: 'control', numOfElements: 6 },
    { name: 'incident', numOfElements: 1 },
    { name: 'document', numOfElements: 3 },
    { name: 'scenario', numOfElements: 1 }
  ];

  it('should switch domain and verify domain selection', () => {
    cy.selectDomain('IT-Grundschutz');

    cy.getCustom('[data-veo-test="domain-select"] span')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('IT-Grundschutz');
        cy.getCustom('[data-component-name="breadcrumbs"]').contains('ITGS');
        cy.testEmptyDashboard(itgs_widgets);
      });

    cy.selectDomain('DS-GVO');

    cy.getCustom('[data-veo-test="domain-select"] span')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('DS-GVO');
        cy.getCustom('[data-component-name="breadcrumbs"]').contains('DS-GVO');
        cy.testEmptyDashboard();
      });
  });
});
