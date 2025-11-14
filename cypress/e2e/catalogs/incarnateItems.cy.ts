import type { UnitDetails} from '../../support/setupHelpers';
import { generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Catalogs', { testIsolation: false }, () => {
  before(() => {
    unitDetails = generateUnitDetails('catalogs');
    cy.login();
    cy.createUnit(unitDetails); // Assuming you have a function to create the unit
    cy.acceptAllCookies();
  });

  after(() => cy.deleteUnit(unitDetails.name));

  it('renders catalog table correctly', () => {
    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);

    // Check if the correct number of items is displayed
    cy.veoRequest({
      endpoint: `domains/${Cypress.env(unitDetails.name).domains[0].id}/catalog-items?size=20&sortBy=abbreviation&sortOrder=asc`,
      method: 'GET'
    }).then((response: any) => {
      // Get number of table rows, which should be rendered
      const expectedDataTableRows = response.body.totalItemCount > 25 ? 25 : response.body.totalItemCount;

      cy.navigateTo({ group: 'catalog', entry: 'all' });

      getTableRows().as('tableRows');

      // Get table footer
      cy.getCustom('.v-data-table-footer__info div').as('tableFooter');

      // Check if table footer displays the right number of total catalog items
      cy.getCustom('@tableFooter').contains(response.body.totalItemCount);
      // Check if the number of rendered table rows is correct
      cy.getCustom('@tableRows').should('have.length', expectedDataTableRows);
      // Check if the first item is rendered correctly
      cy.getCustom('@tableRows').contains(response.body.items[0].name, { matchCase: false });
      // Check if the last item is rendered correctly
      cy.getCustom('@tableRows').contains(response.body.items.at(-1).name, { matchCase: false });
    });
  });

  it('incarnates GDPR scenario catalog items', () => {
    cy.visit('/units');
    cy.selectUnit(unitDetails.name);
    const api = {
      scenarios: `${Cypress.env('veoApiUrl')}/domains/**/scenarios**`,
      incarnationDescriptions: `${Cypress.env('veoApiUrl')}/units/**/domains/**/incarnation-descriptions?**`,
      incarnations: `${Cypress.env('veoApiUrl')}/units/**/incarnations`
    };

    let numOfItemsToIncarnate: number;

    cy.navigateTo({ group: 'catalog', entry: 'all' });

    getTableRows().as('tableRows');

    cy.getCustom('@tableRows').then(($rows) => (numOfItemsToIncarnate = $rows.length));

    cy.getCustom('th input').click();

    // Intercept api calls, below we'll check if the right endpoints are being used
    // get incarnation descriptions: tells us what to incarnate
    cy.intercept('GET', api.incarnationDescriptions).as('getIncarnationDescriptions');
    // create objects from catalog items (incarnation)
    cy.intercept('POST', api.incarnations).as('incarnateItems');

    // Start incarnating
    cy.getCustom('[data-veo-test="catalogs-btn-apply"]').click();

    // Check endpoints and response codes
    cy.wait(['@getIncarnationDescriptions']).its('response.statusCode').should('eq', 200);
    cy.wait(['@incarnateItems']).its('response.statusCode').should('eq', 201);

    // Check if all items were created and are rendered
    cy.intercept('GET', api.scenarios).as('getScenarios');
    cy.get('.v-card').find('.close-button').click();
    cy.navigateTo({ group: 'objects', category: 'scenarios', entry: 'all' });
    cy.wait('@getScenarios').its('response.statusCode').should('eq', 200);

    getTableRows().as('scenarioTableRows');
    cy.getCustom('@scenarioTableRows').then(($rows) => expect($rows.length).to.be.equal(numOfItemsToIncarnate));
  });

  function getTableRows() {
    return cy.getCustom('[id^="veo-object-table-"] .v-data-table__tr--clickable');
  }
});
