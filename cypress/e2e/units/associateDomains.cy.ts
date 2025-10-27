import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Add domains', () => {
  before(() => {
    unitDetails = generateUnitDetails('associateDomains');
    cy.login();
    cy.createUnit(unitDetails);
    cy.acceptAllCookies();
    cy.goToUnitSelection();
  });

  after(() => cy.deleteUnit(unitDetails.name));

  it('associates a test unit with the IT-GS domain', () => {
    // DS-GVO is associated on creating the test unit,
    // IT-Grundschutz will be added in this test, thus we check against both
    const domainNames = ['DS-GVO', 'IT-Grundschutz'];
    const selectors = ['[data-veo-test="domain-card-checkbox-it-grundschutz"]'];

    // Get the test unit
    cy.getVeoTestUnitCard(unitDetails.name).as('testUnitCard');

    // Go to /units/**/domains
    cy.getCustom('@testUnitCard').within((_card) => {
      cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains`).as('domains');
      cy.getCustom('[data-veo-test="units-add-domains-button"]').click();
      cy.wait(['@domains']).its('response.statusCode').should('eq', 200);
    });

    // In /domains: select domain
    selectors.forEach((selector) => cy.getCustom(selector).first().click());

    // Associate domains
    cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/units/**`).as('associateDomains');
    cy.getCustom('[data-veo-test="associate-domains"]').click();
    cy.wait(['@associateDomains']).its('response.statusCode').should('eq', 200);

    // Check if veo redirects to /units after successfully association the new domain
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units`);

    // Check if new domains show up in card
    cy.getCustom('@testUnitCard').within((_card) => {
      cy.getCustom('[data-veo-test="item-card-slot-left"] .v-chip').as('domainButtons');
    });
    cy.getCustom('@domainButtons').each((button) => {
      expect(domainNames).to.includes(button.text());
    });
  });
});
