/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      goToUnitSelection: typeof goToUnitSelection;
      selectUnit: typeof selectUnit;
      createUnit: typeof createUnit;
      deleteUnit: typeof deleteUnit;
    }
  }
}

export function goToUnitSelection():void {
  cy.visit('/');
  cy.intercept('GET', 'https://api.develop.verinice.com/veo/units').as('getUnits');
  cy.wait(['@getUnits'], { responseTimeout: 15000 }).its('response.statusCode').should('eq', 200);
  cy.get('nav a').contains('Unit management').click();
}

export function selectUnit({ name }:{name: string}):void {
  cy.get('[data-component-name="unit-selection-available-units"] a').contains(name).click()
};

export function createUnit({
  name="CY-TEST-UNIT", description="CY-TEST-UNIT-DESCRIPTON",
  desiredDomains=['DS-GVO']
}:{name: string, description?: string, desiredDomains?: string[]}):void {
  cy.get('.veo-primary-action-fab button').click();

  // Choose domains
  cy.get('.new-unit-form .v-list-item').as('availableDomains').then( $el => {
    const numAvailableDomains = $el.length;

    if( numAvailableDomains > 1 ) {
      cy.get('@availableDomains').click({ multiple: true });
      desiredDomains.forEach( domain => cy.get('@availableDomains').contains(domain).click() )
    }

    else if( numAvailableDomains < desiredDomains.length ){
      cy.log('Desired domains:', desiredDomains);
      cy.get('@availableDomains').then( $el => cy.log($el.text()) );
      throw new Error("Some of the choosen domains are not applicable");
    }

    else if( numAvailableDomains === 1 && desiredDomains.length === 1 ) {
      cy.get('@availableDomains').contains(desiredDomains[0]);
    }
  });

  // Create new unit
  cy.intercept('GET', 'https://api.develop.verinice.com/veo/units/**').as('getNewUnit');
  cy
    .get('.new-unit-form input').first().type(name)
    .get('.new-unit-form input').last().type(description)
    .get('.v-card-actions button').last().click();

  cy.wait(['@getNewUnit'], { responseTimeout: 15000 })
    .its('response.statusCode').should('eq', 200);
}

export function deleteUnit({ unitName }:{unitName: string}):void {
  cy
    .get('.v-list-item--link').contains(unitName).parent().parent()
    .find('[data-component-name="unit-selection-delete-unit-button"]').click();

  // Get delete dialog
  cy
    .get('.v-card-title').contains('Delete unit').parent().parent()
    .as('deleteDialog');

  // Set up a listener for API responses
  cy
    .intercept('DELETE', 'https://api.develop.verinice.com/veo/units/**')
    .as('deleteUnit');

  // Request delete unit
  cy
    .get('@deleteDialog').find('input').type(unitName)
    .get('@deleteDialog').find('button').last().click();

  // Wait for API response and assert
  cy
    .wait(['@deleteUnit'], { responseTimeout: 15000 })
    .its('response.statusCode').should('eq', 204);
}

