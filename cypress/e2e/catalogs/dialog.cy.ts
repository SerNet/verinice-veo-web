import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Catalogs', { testIsolation: false }, () => {
  before(() => {
    unitDetails = generateUnitDetails('catalogs');
    cy.login();
    cy.createUnit(unitDetails); 
    cy.acceptAllCookies();
  });

  after(() => cy.deleteUnit(unitDetails.name));
  it('renders catalog dialog and selects an item', () => {
    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);

    // Open the catalog dialog
    cy.navigateTo({ group: 'catalog', entry: 'all' });
    const api = {
      scenarios: `${Cypress.env('veoApiUrl')}/domains/**/scenarios**`,
      incarnationDescriptions: `${Cypress.env('veoApiUrl')}/units/**/domains/**/incarnation-descriptions?**`,
      incarnations: `${Cypress.env('veoApiUrl')}/units/**/incarnations`
    };

    
    // create objects from catalog items (incarnation)
    cy.intercept('POST', api.incarnations).as('incarnateItems');

   // Get the text of the first item 
    
    cy.getCustom('.v-data-table__tr').first().then(($row) => {
      const cells = $row.children();
          const texts = [];
          cells.each((_index, cell) => {
            texts.push(Cypress.$(cell).text());
          });

          const name = texts[2];
      cy.getCustom('.v-data-table__tr').first().click();
    cy.get('[data-veo-test="catalogs-btn-apply"]').click(); 
    
    

    // Wait for the dialog to open
    cy.get('[data-veo-test="catalog-dialog"]').should('be.visible');

    // Check if the items from the catalog are displayed in the dialog
    cy.get('[data-veo-test="catalog-dialog"]').find('.v-data-table__tr--clickable').should('have.length', 1); 

    // Click on the first item in the dialog
    cy.get('[data-veo-test="catalog-dialog"]').find('.v-data-table__tr--clickable').first().click(); 

    
      cy.getCustom('[data-component-name="breadcrumbs"]').contains(name.toUpperCase(), { matchCase: false });
      
    });
  });

   
  });

