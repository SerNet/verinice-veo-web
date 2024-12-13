/*
 * verinice.veo web
 * Copyright (C) 2024 jae
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';
import { createObject, getModules } from '../../requests/objects';
import { applyCatalogItem } from '../../requests/catalogs';
import { addModule, fetchRequirementImplementations } from '../../requests/control-implementations';
import { visitRIList } from '../../commands/navigation';

// Used for intercepting requests
const apiRoutes = {
  scopes: `${Cypress.env('veoApiUrl')}/domains/**/scopes/**`,
  incarnationDescriptions: `${Cypress.env('veoApiUrl')}/units/**/domains/**/incarnation-descriptions?**`,
  incarnations: `${Cypress.env('veoApiUrl')}/units/**/incarnations`,
  catalogItems: `${Cypress.env('veoApiUrl')}/domains/**/catalog-items?subType=CTL_Module**`,
  requirementImplementations: `${Cypress.env('veoApiUrl')}/**/control-implementations/**/requirement-implementations?**`
};

// Static test data
const testRIData = {
  description: 'test-description',
  person: 'test-person'
};

const testPerson = {
  owner: {},
  riskDefinition: 'GSRA',
  name: testRIData.person,
  objectType: 'person',
  subType: 'PER_Person',
  objectTypePlural: 'persons',
  status: 'NEW'
};

// Navigation helpers
function openModulesTab() {
  cy.visitObject();
  cy.getCustom('[data-component-name="object-details-controls-tab"]').click();
  cy.getCustom('[data-component-name="object-details-controls-tab"]').click();
}

function openAddModulesDialog() {
  openModulesTab();
  cy.getCustom('[data-component-name="object-details-actions-button"]').click();
  cy.getCustom('[data-component-name="object-details-actions-button"]').click();
  cy.containsCustom('Model modules').click({ force: true }); // Implicit testing of the button's label!
}

function openFirstRI() {
  visitRIList();
  // Open first RI in editor
  cy.getCustom('td').first().click();
}

// GUI setup
let unitDetails: UnitDetails;
function setupVeo() {
  unitDetails = generateUnitDetails('workWithRis');
  return cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['IT-Grundschutz'] }).then(() => {
    createObject();
    cy.login();
    cy.acceptAllCookies();
  });
}

describe('Object details, modules tab: Content', () => {
  beforeEach(() => setupVeo());
  afterEach(() => cy.deleteUnit());

  it('checks user info (no modules were applied yet)', () => {
    // Navigate
    openAddModulesDialog();

    // Check if user info exists
    cy.containsCustom('No modules applied yet. Please apply modules from the catalog');

    // Click link to `/catalogs`
    cy.intercept('GET', apiRoutes.catalogItems).as('getCatalogItems');
    cy.getCustom('tr').containsCustom('catalog').click({ force: true });
    cy.wait(['@getCatalogItems']).its('response.statusCode').should('eq', 200);

    // Check if the link took you to the right place
    cy.getCustom('[data-component-name="breadcrumbs"]').then((breadcrumbs: JQuery<HTMLElement>) =>
      expect(breadcrumbs).to.contain('Catalog')
    );
    cy.url().then((url) => expect(url).to.contain('catalog?type=control&subType=CTL_Module'));
  });
});

describe('Object details, compliance tab: Actions', () => {
  beforeEach(() => {
    setupVeo().then(() => {
      // Populate the module tab table with one item
      applyCatalogItem().then(() => {
        // Get modules to check GUI against module properties later on:
        // this function writes module data into the cypress env `dynamicTestData`
        getModules();
      });
    });
    cy.login();
    cy.acceptAllCookies();
  });

  afterEach(() => cy.deleteUnit());

  it('adds a module to the test object', () => {
    const module = Cypress.env('dynamicTestData').modules[0];

    // Navigate
    openAddModulesDialog();

    // Tick the module's checkbox
    cy.getCustom('td input').click();

    // Try adding it
    cy.intercept('GET', apiRoutes.scopes).as('getScopes');
    cy.getCustom('.v-card-actions button').contains('Save').click({ force: true });
    cy.wait(['@getScopes']).its('response.statusCode').should('eq', 200);

    // Check if it was indeed added
    cy.getCustom('[data-veo-test="control-name"]')
      .invoke('text')
      .then((text: string) => {
        expect(text).to.equal(module.name);
      });
    cy.getCustom('[data-veo-test="control-abbreviation"]')
      .invoke('text')
      .then((text: string) => {
        expect(text).to.equal(module.abbreviation);
      });
  });

  it('navigates to the list of requirement implementations', () => {
    const dynamicTestData = Cypress.env('dynamicTestData');
    const complianceListUrl = `${dynamicTestData.unit.unitId}/domains/${dynamicTestData.unit.domains[0].id}/compliance?type=${dynamicTestData.testObject.objectType}&targetObject=${dynamicTestData.testObject.id}`;

    // API setup
    addModule();

    // Navigate
    openModulesTab();

    cy.intercept('GET', apiRoutes.requirementImplementations).as('getRequirementImplementations');
    cy.getCustom('[data-veo-test="object-details-action-btn-implementations"]').click();
    cy.wait(['@getRequirementImplementations']).its('response.statusCode').should('eq', 200);

    cy.url().then((url) => expect(url).to.contain(complianceListUrl));
  });

  it('removes a compliance module', () => {
    // API setup
    addModule();

    // Navigate
    openModulesTab();

    // Remove a module
    cy.intercept('PUT', apiRoutes.scopes).as('removeModule');
    cy.getCustom('[data-veo-test="object-details-action-btn-delete"]').click();
    cy.getCustom('[data-veo-test="confirmation-dialog-btn-ok"]').click();
    cy.wait(['@removeModule']).its('response.statusCode').should('eq', 200);

    // Check if table is empty
    cy.getCustom('[data-veo-test="object-details-tab-table-controls"] tbody tr').then(
      ($tableRow: JQuery<HTMLElement>) => expect($tableRow).to.have.class('v-data-table-rows-no-data')
    );
  });
});

describe('Requirement Implementations:  List', () => {
  beforeEach(() => {
    // Setup API
    setupVeo().then(() => {
      applyCatalogItem().then(() => {
        addModule().then(() => {
          getModules().then(() => {
            fetchRequirementImplementations();
          });
        });
      });
    });
  });

  afterEach(() => cy.deleteUnit());

  it('checks if the list of requirement implementations is complete', () => {
    visitRIList();
    cy.checkPagination(['abbreviation, name, status']);
  });

  it('checks if breadcrumbs are correct', () => {
    const dynamicTestData = Cypress.env('dynamicTestData');

    const unitName = dynamicTestData.unit.name;
    const domainName = 'ITGS';
    const objectTypePlural = dynamicTestData.testObject.objectTypePlural;
    const subType = dynamicTestData.testObject.subTypePlural;
    const objectName = dynamicTestData.testObject.name;
    const moduleName = `${dynamicTestData.modules[0].name}`;

    // Navigate
    visitRIList();

    cy.getCustom('[data-veo-test="breadcrumbs"]').contains('Compliance').should('not.exist');

    cy.getCustom('[data-veo-test="breadcrumbs"] li').as('breadcrumbs');
    cy.get('@breadcrumbs')
      .eq(0)
      .invoke('text')
      .then((text: string) => expect(text).to.eq(unitName));
    cy.get('@breadcrumbs')
      .eq(1)
      .invoke('text')
      .then((text: string) => expect(text).to.eq(domainName));
    cy.get('@breadcrumbs')
      .eq(2)
      .invoke('text')
      .then((text: string) => expect(text).to.eq(objectTypePlural));
    cy.get('@breadcrumbs')
      .eq(3)
      .invoke('text')
      .then((text: string) => expect(text).to.eq(subType));
    cy.get('@breadcrumbs')
      .eq(4)
      .invoke('text')
      .then((text: string) => expect(text).to.contain(objectName));
    cy.get('@breadcrumbs')
      .eq(5)
      .invoke('text')
      .then((text: string) => expect(text).to.eq(`Implementation (${moduleName})`));
  });
});

describe('Requirement Implementations: Editor', () => {
  beforeEach(() => {
    // Setup API
    setupVeo().then(() => {
      applyCatalogItem();
      addModule();
      getModules().then(() => {
        fetchRequirementImplementations();
      });

      // Create a person
      createObject({
        domainId: Cypress.env('dynamicTestData').unit.domains[0].id,
        unitId: Cypress.env('dynamicTestData').unit.unitId,
        objectData: testPerson,
        dynamicTestDataKey: 'testPerson'
      });
    });
  });

  afterEach(() => cy.deleteUnit());

  it('checks if editor shows the right information', () => {
    // Navigate
    openFirstRI();
    cy.getCustom('[data-veo-test="compliance-editor"]').as('editor');
    cy.get('@editor').within(() => {
      const requirementImplementation = Cypress.env('dynamicTestData').ris[0];

      // Assertions
      // Dialog title
      cy.getCustom('.v-card-title').then(($title: JQuery<HTMLElement>) =>
        expect($title).to.contain('Edit implementation')
      );

      // Target object
      cy.getCustom('[data-veo-test="compliance-editor-target-object"] input')
        .invoke('val')
        .then((targetObjectName: string) =>
          expect(targetObjectName).to.contain(requirementImplementation.origin.displayName)
        );

      // RI
      // abbreviation
      cy.getCustom('[data-veo-test="compliance-editor-ri-abbreviation"] input')
        .invoke('val')
        .then((riAbbreviation: string) =>
          expect(riAbbreviation).to.contain(requirementImplementation.control.abbreviation)
        );

      // name
      cy.getCustom('[data-veo-test="compliance-editor-ri-name"] input')
        .invoke('val')
        .then((riName: string) => expect(riName).to.contain(requirementImplementation.control.name));
    });
  });

  it.only('modifies a requirement implementation', () => {
    // Navigate
    openFirstRI();
    // Add some new data
    cy.getCustom('[data-veo-test="compliance-editor"]').as('editor');
    cy.get('@editor').within(() => {
      cy.getCustom('[data-veo-test="compliance-editor-staus-No"] input').click();
      cy.getCustom('[data-veo-test="compliance-editor-ri-responsible-person"]')
        .click()
        .clear()
        .type('test-person')
        .type('{downArrow}{enter}');
      cy.getCustom('[data-veo-test="compliance-editor-description"] textarea').click().type(testRIData.description);

      // Typing does currently not work
      //cy.getCustom('[data-veo-test="compliance-editor-ri-responsible-implementation-date"]').click().type('11.11.2111').type("{esc}");

      // Save
      cy.intercept('GET', apiRoutes.requirementImplementations).as('getRIs');
      cy.get('button').contains('Save').click();
      cy.wait(['@getRIs']).its('response.statusCode').should('eq', 200);
    });

    // Assert content of RI list
    cy.getCustom('[data-veo-test="responsible.displayName"]')
      .first()
      .then(($responsibleCol: JQuery<HTMLElement>) => expect($responsibleCol).to.contain(testPerson.name));

    cy.getCustom('[data-veo-test="translations.status"]')
      .first()
      .first()
      .then(($statusCol: JQuery<HTMLElement>) => expect($statusCol).to.contain('no'));

    // Open editor again
    cy.getCustom('td').first().click();

    cy.getCustom('[data-veo-test="compliance-editor"]').as('editor');
    cy.get('@editor').within(() => {
      // Assert
      cy.getCustom('[data-veo-test="compliance-editor-staus-No"] input')
        .invoke('val')
        .then((status: string) => expect(status).to.eq('NO'));

      // Currently the input field always has a value of ''
      //cy.getCustom('[data-veo-test="compliance-editor-ri-responsible-person"] input').invoke('val').then((person: string) => expect(person).to.eq(testRIData.person));
      cy.getCustom('[data-veo-test="compliance-editor-ri-responsible-person"]').then(
        ($personInp: JQuery<HTMLElement>) => expect($personInp).to.contain(testRIData.person)
      );

      cy.getCustom('[data-veo-test="compliance-editor-description"] textarea')
        .invoke('val')
        .then((description: string) => expect(description).to.eq(testRIData.description));

      //cy.getCustom('[data-veo-test="compliance-editor-ri-responsible-implementation-date"]').invoke('val').then(() =>{})
    });
  });
});
