describe('Add domains', () => {
  before(() => {
    cy.login();
    cy.createUnit();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
  });

  after(() => cy.deleteUnit());

  it('associates a test unit with the IT-GS domain', () => {
    // DS-GVO is associated on creating the test unit,
    // IT-Grundschutz will be added in this test, thus we check against both
    const domainNames = ['DS-GVO', 'IT-Grundschutz'];
    const selectors = ['[data-veo-test="domain-card-checkbox-itgs"]'];

    // Get the test unit
    cy.getVeoTestUnitCard().as('testUnitCard');

    // Go to /units/**/domains
    cy.get('@testUnitCard').within((_card) => {
      cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains`).as('domains');
      cy.get('[data-veo-test="units-add-domains-button"]').click();
      cy.wait(['@domains']).its('response.statusCode').should('eq', 200);
    });

    // In /domains: select domain
    selectors.forEach((selector) => cy.get(selector).click());

    // Associate domains
    cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/units/**`).as('associateDomains');
    cy.get('[data-veo-test="associate-domains"]').click();
    cy.wait(['@associateDomains']).its('response.statusCode').should('eq', 200);

    // Check if veo redirects to /units after successfully association the new domain
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/units`);

    // Check if new domains show up in card
    cy.get('@testUnitCard').within((_card) => {
      cy.get('[data-veo-test="item-card-slot-left"] button').as('domainButtons');
    });
    cy.get('@domainButtons').each((button) => {
      expect(domainNames).to.includes(button.text());
    });
  });
});
