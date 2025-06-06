import { truncate } from 'lodash';
import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

const crumbDefaultLength = 22;

let unitDetails: UnitDetails;

describe('Navigation Menu', () => {
  before(() => {
    unitDetails = generateUnitDetails('NavigationMenu');
    cy.login();
    cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['IT-Grundschutz', 'DS-GVO'] });
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
    cy.handleLanguageBug();
  });

  after(() => cy.deleteUnit(unitDetails.name));

  const groupsWithCategories = [
    {
      name: 'objects',
      elementTypes: ['Scopes', 'Processes', 'Assets', 'Persons', 'Incidents', 'Documents', 'Scenarios', 'Controls']
    }
  ];

  it.only('DSGVO navigate to all expected menu entries', () => {
    cy.selectDomain('DS-GVO');

    cy.getCustom('[data-veo-test="domain-select"]').should('be.visible');
    cy.getCustom('[data-component-name="unit-select"]').should('be.visible');
    cy.getCustom('[data-veo-test="nav-entry-title"]').as('navEntries');
    cy.getCustom('@navEntries').contains('Dashboard');
    cy.getCustom('@navEntries').contains('Editors');

    const groupsDsgvo = [
      {
        name: 'catalog',
        entry: ['data processings', 'scenarios', 'toms']
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
        entry: ['dsra']
      }
    ];
    cy.intercept('GET', `${Cypress.env('veoApiUrl')}/**`).as('gettingData');

    groupsWithCategories.forEach((group) => {
      group.elementTypes.forEach((elementType) => {
        cy.navigateTo({ group: group.name, category: elementType });
        cy.selectFirstSubType(elementType, ($subType: JQuery<HTMLElement>) => {
          cy.wrap($subType).click();
          cy.wait(['@gettingData'], { responseTimeout: 15000 })
            .its('response.statusCode')
            .should('be.oneOf', [200, 304]);
          cy.getCustom('[data-component-name="breadcrumbs"]').contains(
            truncate($subType.text(), { length: crumbDefaultLength }),
            { matchCase: false }
          );
        });
      });
    });

    groupsDsgvo.forEach((group) => {
      group.entry.forEach((entry) => {
        cy.navigateTo({ group: group.name, entry: entry });
        cy.wait(['@gettingData'], { responseTimeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.getCustom('[data-component-name="breadcrumbs"]').contains(
          truncate(entry.toLowerCase(), { length: crumbDefaultLength }),
          { matchCase: false }
        );
      });
    });
  });

  it('ITGS navigate to all expected menu entries', () => {
    cy.selectDomain('IT-Grundschutz');

    cy.getCustom('[data-veo-test="domain-select"] span')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('IT-Grundschutz');
        cy.getCustom('[data-component-name="breadcrumbs"]').contains('ITGS');
      });

    cy.getCustom('[data-veo-test="domain-select"]').should('be.visible');
    cy.getCustom('[data-component-name="unit-select"]').should('be.visible');
    cy.getCustom('[data-veo-test="nav-entry-title"]').as('navEntries');
    cy.getCustom('@navEntries').contains('Dashboard');
    cy.getCustom('@navEntries').contains('Editors');

    const groupsItgs = [
      {
        name: 'catalog',
        entry: ['elementary threats', 'information domains', 'layers', 'modules', 'requirements', 'families']
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
        entry: ['gsra']
      }
    ];
    cy.intercept('GET', `${Cypress.env('veoApiUrl')}/**`).as('gettingData');

    groupsWithCategories.forEach((group) => {
      group.elementTypes.forEach((elementType) => {
        cy.navigateTo({ group: group.name, category: elementType });
        cy.selectFirstSubType(elementType, ($subType: JQuery<HTMLElement>) => {
          cy.wrap($subType).click();
          cy.wait(['@gettingData'], { responseTimeout: 15000 })
            .its('response.statusCode')
            .should('be.oneOf', [200, 304]);
          cy.getCustom('[data-component-name="breadcrumbs"]').contains(
            truncate($subType.text(), { length: crumbDefaultLength }),
            { matchCase: false }
          );
        });
      });
    });

    groupsItgs.forEach((group) => {
      group.entry.forEach((entry) => {
        cy.navigateTo({ group: group.name, entry: entry });
        cy.wait(['@gettingData'], { responseTimeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.getCustom('[data-component-name="breadcrumbs"]').contains(
          truncate(entry.toLowerCase(), { length: crumbDefaultLength }),
          { matchCase: false }
        );
      });
    });
  });
});
