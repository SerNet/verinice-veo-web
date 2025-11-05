describe('Add Elements to other Domain', () => {
  beforeEach(() => {
    cy.setupVeo('addElementToOtherDomain', ['DS-GVO', 'IT-Grundschutz']).then(() => {
      const unitId = Cypress.env('dynamicTestData').testUnits[0].unitId;
      const domainId = Cypress.env('dynamicTestData').testUnits[0].domains.find((d) => d.name === 'DS-GVO').id;
      cy.visit(`${unitId}/domains/${domainId}/scopes/SCP_Scope`, { failOnStatusCode: false });
    });
  });

  it('adds an element of type SCOPE to IT-GS', () => {
    const targetDomain = 'IT-Grundschutz';
    cy.getCustom('[data-veo-test="object-overview-assign-button"]').click();

    // Get dialog content
    cy.getCustom('[data-veo-test="dialog-card"]').as('container');

    cy.get('@container').within(() => {
      // Regex matches exact text
      cy.contains('.v-list-item', targetDomain).closest('.v-list-item').as('DomainItem');
    });
    // Select domain
    cy.get('@DomainItem')
      .within(() => {
        cy.get('.v-icon--clickable').first().click();
      })
      .as('DomainItemSelected');

    // Fill in subtype and status
    cy.get('@DomainItemSelected')
      .within(() => {
        cy.get('[data-veo-test="subtype-select"]').click();
      })
      .then(() =>
        cy
          .get('.v-menu .v-list-item')
          .contains('Scope')
          .then(($item) => $item[0].click())
      );

    cy.get('@DomainItemSelected')
      .within(() => {
        cy.getCustom('[data-veo-test="status-select"]').click();
      })
      .then(() =>
        cy
          .getCustom('.v-menu .v-list-item')
          .contains('New')
          .then(($item) => $item[0].click())
      );

    // Save
    cy.getCustom('button').contains('Save').click();

    // Verify that the element now appears in the target domain
    const unitId = Cypress.env('dynamicTestData').testUnits[0].unitId;
    const domainId = Cypress.env('dynamicTestData').testUnits[0].domains.find((d) => d.name === targetDomain).id;
    cy.visit(`${unitId}/domains/${domainId}/scopes/SCP_Scope`, { failOnStatusCode: false });

    return cy
      .getCustom('[data-veo-test="loadedDataTable"] tbody tr')
      .then(($rows) => expect($rows.length).to.be.equal(2));
  });
});
