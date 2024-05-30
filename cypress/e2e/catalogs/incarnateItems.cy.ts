describe('Catalogs', { testIsolation: false }, () => {
  before(() => {
    cy.login();
    cy.acceptAllCookies();
    cy.createUnit();
  });

  after(() => cy.deleteUnit());

  it('renders catalog table correctly', () => {
    cy.goToUnitSelection();
    cy.selectUnit();

    // Check if the correct number of items is displayed
    cy.veoRequest({
      url: `/api/domains/${Cypress.env('unitDetails').domains[0].id}/catalog-items`,
      method: 'GET',
      waitForRequestMethod: false
    }).then((response: any) => {
      // Get number of table rows, which should be rendered
      const expectedDataTableRows = response.totalItemCount > 20 ? 20 : response.totalItemCount;

      cy.navigateTo({ group: 'catalog', entry: 'all' });

      getTableRows().as('tableRows');

      // Get table footer
      cy.get('.v-data-table-footer__info div').as('tableFooter');

      // Check if table footer displays the right number of total catalog items
      cy.get('@tableFooter').contains(response.totalItemCount);
      // Check if the number of rendered table rows is correct
      cy.get('@tableRows').should('have.length', expectedDataTableRows);
      // Check if the first item is rendered correctly
      cy.get('@tableRows').contains(response.items[0].name, { matchCase: false });
      // Check if the last item is rendered correctly
      cy.get('@tableRows').contains(response.items.at(-1).name, { matchCase: false });
    });
  });

  it('incarnates GDPR scenario catalog items', () => {
    cy.visit('/units');
    cy.selectUnit();
    const api = {
      scenarios: `${Cypress.env('veoApiUrl')}/domains/**/scenarios**`,
      incarnationDescriptions: `${Cypress.env('veoApiUrl')}/units/**/domains/**/incarnation-descriptions?**`,
      incarnations: `${Cypress.env('veoApiUrl')}/units/**/incarnations`
    };

    let numOfItemsToIncarnate: number;

    cy.navigateTo({ group: 'catalog', entry: 'all' });

    getTableRows().as('tableRows');

    cy.get('@tableRows').then(($rows) => (numOfItemsToIncarnate = $rows.length));

    cy.get('th input').click();

    // Intercept api calls, below we'll check if the right endpoints are being used
    // get incarnation descriptions: tells us what to incarnate
    cy.intercept('GET', api.incarnationDescriptions).as('getIncarnationDescriptions');
    // create objects from catalog items (incarnation)
    cy.intercept('POST', api.incarnations).as('incarnateItems');

    // Start incarnating
    cy.get('[data-veo-test="catalogs-btn-apply"]').click();

    // Check endpoints and response codes
    cy.wait(['@getIncarnationDescriptions']).its('response.statusCode').should('eq', 200);
    cy.wait(['@incarnateItems']).its('response.statusCode').should('eq', 201);

    // Check if all items were created and are rendered
    cy.intercept('GET', api.scenarios).as('getScenarios');
    cy.navigateTo({ group: 'objects', category: 'scenario', entry: 'all' });
    cy.wait('@getScenarios').its('response.statusCode').should('eq', 200);

    getTableRows().as('scenarioTableRows');
    cy.get('@scenarioTableRows').then(($rows) => expect($rows.length).to.be.equal(numOfItemsToIncarnate));
  });

  function getTableRows() {
    return cy.get('[id^="veo-object-table-"] .v-data-table__tr--clickable');
  }
});
