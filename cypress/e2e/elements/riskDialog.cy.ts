import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;
let currentUnit = '';
before(() => {
  unitDetails = generateUnitDetails('riskDialog');
  cy.login();
  cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
  cy.acceptAllCookies();
  cy.goToUnitSelection();
  cy.selectUnit(unitDetails.name);
  cy.selectDomain('DS-GVO');
});

describe('Risk Dialog', { testIsolation: false, retries: 0 }, () => {
  beforeEach(() => {
    cy.login();
    if (currentUnit) {
      cy.visit(currentUnit, { failOnStatusCode: false });
    }
    cy.handleLanguageBug();
    cy.viewport(2000, 1320);
    cy.acceptAllCookies();
  });
  after(() => cy.deleteUnit(unitDetails.name));

  it('should set a Risk Definition to an Element', () => {
    cy.navigateTo({ group: 'objects', category: 'scopes' });
    cy.selectFirstSubType('scopes', ($subType: JQuery<HTMLElement>) => {
      cy.wrap($subType).click();
      cy.checkSubTypePage($subType[0].innerText);
      cy.getCustom('.v-data-table__tr').first().click();
    });
    cy.getCustom('[data-component-name="object-details-risks-tab"]').should('have.attr', 'disabled');
    cy.url().then((fullUrl) => {
      currentUnit = fullUrl;
    });
    cy.getCustom('input[id="#/properties/riskDefinition"]').scrollIntoView().click();
    cy.getCustom('.v-overlay-container').contains('DSRA').click();

    cy.containsCustom('Save').click();
    cy.getCustom('[data-component-name="object-details-risks-tab"]').first().should('not.have.attr', 'disabled');
  });

  let selectedRiskText = '';

  it('should add a Scenario to an Element', () => {
    cy.getCustom('[data-component-name="object-details-risks-tab"]').first().click();
    cy.getCustom('[data-component-name="object-details-actions-button"]').click();
    cy.getCustom('.v-overlay__content').contains('Create risk').click();
    cy.getCustom('[data-veo-test="dialog-card"]').as('container');

    // Get the text of the parent row when clicking the checkbox
    cy.getCustom('@container').within(() => {
      cy.getCustom('[id^="checkbox-"]')
        .filter('[aria-disabled="false"]')
        .first()
        .then(($checkbox) => {
          const $parentRow = $checkbox.closest('tr');
          selectedRiskText = $parentRow.find('td').eq(4).text().trim();
          Cypress.env('selectedRiskText', selectedRiskText);
          cy.wrap(selectedRiskText).as('selectedRiskText');
          cy.wrap($checkbox).click();
        });
    });

    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/scopes/**/risks`).as('addRisk');
    cy.containsCustom('create risk').should('exist').click();
    cy.wait('@addRisk').its('response.statusCode').should('eq', 201);
    cy.getCustom('[data-veo-test="loadedDataTable"]').should('be.visible');
    cy.getCustom('.v-data-table__tr.v-data-table__tr--clickable').should('have.length.greaterThan', 0);

    cy.get('@selectedRiskText').then((selectedRiskText) => {
      cy.getCustom('.v-data-table__tr.v-data-table__tr--clickable').contains(selectedRiskText).should('exist');
    });
  });

  it('should edit a Scenario through risk dialog', () => {
    cy.getCustom('[data-component-name="object-details-risks-tab"]').first().click();
    cy.getCustom('[data-veo-test="loadedDataTable"]').should('be.visible');
    const selectedRiskText = Cypress.env('selectedRiskText');
    cy.getCustom('.v-data-table__tr.v-data-table__tr--clickable').contains(selectedRiskText).should('exist').click();

    cy.getCustom('[data-veo-test="dialog-card"]').as('container');
    cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**/persons?unit=**`).as('getPersons');

    cy.getCustom('@container').within(() => {
      cy.getCustom('[data-test-selector="risk-owner"]').should('be.visible').click();
    });
    cy.wait('@getPersons').its('response.statusCode').should('eq', 200);
    cy.wait(500);
    cy.getCustom('.v-overlay__content div[role="listbox"]').first().click();
    cy.getCustom('.v-card').contains('button', 'Save').click();
    cy.wait(1000);
    cy.getCustom('.v-card').find('.close-button').click();
    cy.getCustom('[data-component-name="object-details-risks-tab"]').first().click();
    cy.getCustom('.v-data-table__tr.v-data-table__tr--clickable').contains(selectedRiskText).should('exist').click();
    cy.getCustom('@container').within(() => {
      cy.getCustom('[data-test-selector="risk-owner"]').invoke('text').should('not.equal', 'Risk owner');
    });
  });

  it('should add a mitigation to a Scenario', () => {
    cy.getCustom('[data-component-name="object-details-risks-tab"]').first().click();
    cy.getCustom('[data-veo-test="loadedDataTable"]').should('be.visible');
    const selectedRiskText = Cypress.env('selectedRiskText');
    let selectedMitigationText = '';
    cy.getCustom('.v-data-table__tr.v-data-table__tr--clickable').contains(selectedRiskText).should('exist').click();

    cy.getCustom('[data-veo-test="dialog-card"]').as('container');
    cy.getCustom('@container').within(() => {
      cy.getCustom('[data-veo-test="add-mitigation"]').click();
    });
    cy.getCustom('.v-overlay__content div[role="listbox"]').contains('div', 'add mitigating action').click();
    cy.getCustom('[data-veo-test="link-dialog"]').within(() => {
      cy.getCustom('[id^="checkbox-"]')
        .filter('[aria-disabled="false"]')
        .first()
        .then(($checkbox) => {
          const $parentRow = $checkbox.closest('tr');
          selectedMitigationText = $parentRow.find('td').eq(4).text().trim();
          cy.wrap(selectedMitigationText).as('selectedMitigationText');
          cy.wrap($checkbox).click();
        });
      cy.containsCustom('Save').should('exist').click();
    });
    cy.get('@selectedMitigationText').then((selectedMitigationText) => {
      cy.getCustom('.v-data-table__tr').contains(selectedMitigationText).should('exist');
    });
    cy.getCustom('.v-card').contains('button', 'Save').click();
    cy.get('.v-card').find('.close-button').click();
    cy.getCustom('[data-component-name="object-details-risks-tab"]').first().click();
    cy.getCustom('.v-data-table__tr.v-data-table__tr--clickable').contains(selectedRiskText).should('exist').click();

    cy.get('@selectedMitigationText').then((selectedMitigationText) => {
      cy.getCustom('.v-data-table__tr').contains(selectedMitigationText).should('exist');
    });
  });
});
