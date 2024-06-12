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
    cy.selectDomain('DS-GVO');
  });

  after(() => cy.deleteUnit());

  const elementTypeList: string[] = ['Scope', 'Process', 'Asset', 'Person', 'Incident', 'Document', 'Scenario'];

  elementTypeList.forEach((elementType) => {
    const pluralizedElementType = elementType.toLowerCase() + (elementType === 'Process' ? 'es' : 's');

    it('deletes element in ' + elementType, () => {
      handleLanguageBug();
      navigateToElementType(elementType);

      iterateSubTypes(elementType, ($subType) => {
        cy.wrap($subType).click();
        cy.wait(100);

        selectOriginalRow();
        let initialTotalItems;
        cy.get('.v-data-table-footer__info > div').then(($element) => {
          const footerText = $element.text(); // Get the text content of the footer
          const totalItemsMatch = footerText.match(/of (\d+)/); // Use regex to extract the number after 'of'
          if (totalItemsMatch) {
            initialTotalItems = parseInt(totalItemsMatch[1], 10); // Convert the extracted string to a number
          }
        });

        cy.get('@originalRow').then(($row) => {
          interceptDeleteRequest(pluralizedElementType);
          cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**`).as('getElements');

          deleteElement($row);
          cy.wait('@deleteElement').its('response.statusCode').should('eq', 204);
          cy.wait('@getElements').its('response.statusCode').should('eq', 200);
          cy.wait(200);
          cy.get('.v-data-table-footer__info > div', { timeout: 10000 })
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

    const selectOriginalRow = () => {
      cy.get('.v-data-table__tr').first().as('originalRow');
    };

    const handleLanguageBug = () => {
      cy.get('nav[data-component-name="primary-navigation"]').then((body) => {
        if (body.find('div[data-component-name="objects-nav-item"]:contains("Objects")').length === 0) {
          cy.languageTo('English');
        }
      });
    };

    const navigateToElementType = (elementType) => {
      cy.navigateTo(['Objects', elementType]);
    };

    const interceptDeleteRequest = (pluralizedElementType) => {
      cy.intercept('DELETE', `${Cypress.env('veoApiUrl')}/${pluralizedElementType}/**`).as('deleteElement');
    };

    const deleteElement = ($row) => {
      cy.wrap($row).find('[data-component-name="object-overview-delete-button"]').should('exist').click();
      cy.contains('button', 'Delete').should('exist').click();
    };
  });
});
