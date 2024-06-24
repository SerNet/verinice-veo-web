describe('Delete elements', () => {
  before(() => {
    cy.login();
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.viewport(1000, 1000);
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit();
  });

  after(() => cy.deleteUnit());

  const elementTypeList: string[] = ['Scope', 'Process', 'Asset', 'Person', 'Incident', 'Document', 'Scenario'];

  elementTypeList.forEach((elementType) => {
    const pluralizedElementType = elementType.toLowerCase() + (elementType === 'Process' ? 'es' : 's');

    it('deletes element in ' + elementType, () => {
      cy.handleLanguageBug();
      cy.navigateTo(['Objects', elementType]);

      iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();
        cy.wait(100);
        cy.get('.v-data-table__tr').first().as('originalRow');

        let initialTotalItems: number;
        cy.get('.v-data-table-footer__info > div').then(($element) => {
          const footerText = $element.text(); // Get the text content of the footer
          const totalItemsMatch = footerText.match(/of (\d+)/); // Use regex to extract the number after 'of'
          if (totalItemsMatch) {
            initialTotalItems = parseInt(totalItemsMatch[1], 10); // Convert the extracted string to a number
          }
        });

        cy.get('@originalRow').then(($row) => {
          cy.intercept('DELETE', `${Cypress.env('veoApiUrl')}/${pluralizedElementType}/**`).as('deleteElement');
          cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**`).as('getElements');

          deleteElement($row);
          cy.wait('@deleteElement').its('response.statusCode').should('eq', 204);
          cy.wait('@getElements').its('response.statusCode').should('eq', 200);
          cy.wait(200);
          cy.get('.v-data-table-footer__info > div')
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

    function iterateSubTypes(elementType, callback) {
      cy.contains('div[sub-group="true"] > div', new RegExp(`^${elementType}$`))
        .should('be.visible')
        .parent()
        .find('a')
        .each(($subType) => {
          if ($subType.text() === 'All') return;
          callback($subType);
        });
    }

    const deleteElement = ($row) => {
      cy.wrap($row).find('[data-component-name="object-overview-delete-button"]').should('exist').click();
      cy.contains('button', 'Delete').should('exist').click();
    };
  });
});
