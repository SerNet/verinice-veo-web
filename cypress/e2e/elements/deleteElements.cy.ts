import { getRandomElementType } from '../../commands/utils';

describe('Delete elements', () => {
  before(() => {
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(Cypress.env('dynamicTestData').testUnits[0].name);
  });

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('deletes element in ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });

      cy.selectFirstSubType(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        cy.checkSubTypePage($subType[0].innerText);

        cy.getCustom('.v-data-table__tr').first().as('originalRow');

        let initialTotalItems: number;
        cy.getCustom('.v-data-table-footer__info > div').then(($element) => {
          const footerText = $element.text(); // Get the text content of the footer
          const totalItemsMatch = footerText.match(/of (\d+)/); // Use regex to extract the number after 'of'
          if (totalItemsMatch) {
            initialTotalItems = parseInt(totalItemsMatch[1], 10); // Convert the extracted string to a number
          }
        });

        cy.getCustom('@originalRow').then(($row) => {
          cy.intercept('DELETE', `${Cypress.env('veoApiUrl')}/${elementType.toLowerCase()}/**`).as('deleteElement');
          cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**`).as('getElements');

          deleteElement($row);

          cy.wait('@deleteElement').its('response.statusCode').should('eq', 204);
          cy.wait('@getElements').its('response.statusCode').should('eq', 200);
          cy.wait(200);
          cy.getCustom('.v-data-table-footer__info > div')
            .should('not.contain', `of ${initialTotalItems}`)
            .then(($element) => {
              const footerText = $element.text();
              const totalItemsMatch = footerText.match(/of (\d+)/);
              if (totalItemsMatch) {
                const updatedTotalItems = parseInt(totalItemsMatch[1], 10);
                expect(updatedTotalItems).to.equal(initialTotalItems - 1);
              }
            });
        });
      });
    });
  });

  const deleteElement = ($row: JQuery<HTMLElement>) => {
    cy.wrap($row).find('[data-component-name="object-overview-delete-button"]').should('exist').click();
    cy.containsCustom('button', 'Delete').should('exist').click();
  };
});
