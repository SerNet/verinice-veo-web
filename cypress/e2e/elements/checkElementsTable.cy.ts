import { getRandomElementType } from '../../commands/utils';

describe('Elements Overview Table', () => {
  before(() => {
    cy.login();
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit();
  });

  after(() => cy.deleteUnit());

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('Check Items of ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });

      cy.iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();
        cy.checkSubTypePage($subType[0].innerText);
        cy.wait(200);

        cy.get('.v-data-table-footer__info > div')
          .invoke('text')
          .then((footerText) => {
            const itemsShownMatch = footerText.match(/(\d+)\s+of\s+\d+/);
            const totalItemsMatch = footerText.match(/of (\d+)/);

            const itemsShown = parseInt(itemsShownMatch[1], 10);
            const totalItems = parseInt(totalItemsMatch[1], 10);

            expect(itemsShown).to.be.greaterThan(0);
            expect(totalItems).to.be.greaterThan(0);

            // Verify the number of rows matches items shown and check each cell
            cy.get('.v-data-table__tr')
              .should('have.length', itemsShown)
              .each(($row) => {
                cy.wrap($row).within(() => {
                  cy.get('td').then(($cells) => {
                    $cells.each((index, cell) => {
                      if (index !== 0 && index !== 2 && index !== $cells.length - 1) {
                        // Skip Icon, Abbreviation, and Actions
                        cy.wrap(cell).invoke('text').should('not.be.empty');
                      }
                    });
                  });
                });
              });
          });
      });
    });
  });
});
