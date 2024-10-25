import { getRandomElementType, waitForPageToLoad, waitForLoadersToDisappear } from '../../commands/utils';
import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';
let unitDetails: UnitDetails;

describe('Elements Overview Table', () => {
  before(() => {
    unitDetails = generateUnitDetails('checkElementsTable');
    cy.login();
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
  });

  after(() => cy.deleteUnit(unitDetails.name));

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('Check Items of ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });
      cy.iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        waitForPageToLoad();
        waitForLoadersToDisappear();

        cy.get('.v-data-table-footer__info > div')
          .invoke('text')
          .then((footerText) => {
            const itemsShownMatch = footerText.match(/(\d+)\s+of\s+\d+/);
            const totalItemsMatch = footerText.match(/of (\d+)/);

            const itemsShown = parseInt(itemsShownMatch[1], 10);
            const totalItems = parseInt(totalItemsMatch[1], 10);

            expect(itemsShown).to.be.greaterThan(0);
            expect(totalItems).to.be.greaterThan(0);

            cy.get('.v-data-table__tr')
              // Verify the number of rows matches items shown
              .should('have.length', itemsShown)
              .each(($row) => {
                cy.wrap($row).within(() => {
                  // Check if data is rendered
                  cy.get('[data-veo-test="name"]').should('not.be.empty');
                  cy.get('[data-veo-test="status"]').should('not.be.empty');
                  cy.get('[data-veo-test="updatedAt"]').should('not.be.empty');
                  cy.get('[data-veo-test="updatedBy"]').should('not.be.empty');
                });
              });
          });
      });
    });
  });
});
