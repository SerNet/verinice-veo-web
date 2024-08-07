describe('Navigation Menu', () => {
  before(() => {
    cy.login();
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' });
    cy.goToUnitSelection();
    cy.addDomain('IT-Grundschutz');
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit();
    cy.handleLanguageBug();
  });

  after(() => {
    cy.deleteUnit();
  });

  const groupsWithCategories = [
    {
      name: 'objects',
      elementTypes: ['Scope', 'Process', 'Asset', 'Person', 'Incident', 'Document', 'Scenario', 'Control']
    }
  ];

  it('DSGVO navigate to all expected menu entries', () => {
    cy.selectDomain('DS-GVO');

    cy.get('[data-veo-test="domain-select"]').should('be.visible');
    cy.get('[data-component-name="unit-select"]').should('be.visible');
    cy.get('[data-veo-test="nav-entry-title"]').as('navEntries');
    cy.get('@navEntries').contains('Dashboard');
    cy.get('@navEntries').contains('Editors');

    const groupsDsgvo = [
      {
        name: 'catalog',
        entry: ['Data Processings', 'Scenarios', 'TOMs']
      },
      {
        name: 'Reports',
        entry: [
          'record of processing activities (processor) according to art. 30 ii gdpr',
          'Overview of requests from data subjects',
          'Notification form for personal data breach',
          'Request from data subject'
        ]
      },
      {
        name: 'Risk definitions',
        entry: ['DSRA']
      }
    ];

    groupsWithCategories.forEach((group) => {
      group.elementTypes.forEach((elementType) => {
        cy.navigateTo({ group: group.name, category: elementType });
        cy.iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
          cy.wrap($subType).click();
          cy.get('[data-component-name="breadcrumbs"]').contains($subType.text(), { matchCase: false });
        });
      });
    });

    groupsDsgvo.forEach((group) => {
      group.entry.forEach((entry) => {
        cy.navigateTo({ group: group.name, entry: entry });
        cy.get('[data-component-name="breadcrumbs"]').contains(entry.toLowerCase(), { matchCase: false });
      });
    });
  });

  it('ITGS navigate to all expected menu entries', () => {
    cy.selectDomain('IT-Grundschutz');

    cy.get('[data-veo-test="domain-select"]').should('be.visible');
    cy.get('[data-component-name="unit-select"]').should('be.visible');
    cy.get('[data-veo-test="nav-entry-title"]').as('navEntries');
    cy.get('@navEntries').contains('Dashboard');
    cy.get('@navEntries').contains('Editors');

    const groupsItgs = [
      {
        name: 'catalog',
        entry: ['Elementary threats', 'Information domains', 'Layers', 'Modules', 'Requirements', 'Families']
      },
      {
        name: 'reports',
        // Empty reports for now
        entry: [
          //   'A.1 Strukturanalyse',
          //   'A.2 Schutzbedarfsfeststellung',
          //   'A.4 Ergebnis des IT-Grundschutz-Checks',
          //   'A.5 Risikoanalyse',
          //   'A.6 Realisierungsplan',
          //   'A.3 Modellierung'
        ]
      },
      {
        name: 'Risk definitions',
        entry: ['GSRA']
      }
    ];

    groupsWithCategories.forEach((group) => {
      group.elementTypes.forEach((elementType) => {
        cy.navigateTo({ group: group.name, category: elementType });
        cy.iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
          cy.wrap($subType).click();
          cy.get('[data-component-name="breadcrumbs"]').contains($subType.text(), { matchCase: false });
        });
      });
    });

    groupsItgs.forEach((group) => {
      group.entry.forEach((entry) => {
        cy.navigateTo({ group: group.name, entry: entry });
        cy.get('[data-component-name="breadcrumbs"]').contains(entry.toLowerCase(), { matchCase: false });
      });
    });
  });
});
