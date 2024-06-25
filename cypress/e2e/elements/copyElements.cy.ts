describe('Copy elements', () => {
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

    it('copies element in ' + elementType, () => {
      cy.handleLanguageBug();

      navigateToElementType(elementType);

      iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();
        cy.wait(100);

        cy.get('.v-data-table__tr') // Adjust this selector if needed to be more specific
          .first()
          .as('originalRow');

        cy.get('@originalRow').then(($row) => {
          cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/${pluralizedElementType}`).as('cloneElement');
          cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**/${pluralizedElementType}**`).as(
            'getClonedElement'
          );
          cy.wrap($row).find('[data-component-name="object-overview-clone-button"]').should('be.visible').click();
          const cells = $row.children();
          const texts = [];
          cells.each((_index, cell) => {
            texts.push(Cypress.$(cell).text());
          });

          const abb = texts[1];
          const name = texts[2];
          const status = texts[3];

          cy.wait('@cloneElement').its('response.statusCode').should('eq', 201);
          cy.wait('@getClonedElement').its('response.statusCode').should('eq', 200);

          verifyElementCopy(abb, name, status);
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

    const navigateToElementType = (elementType) => {
      cy.navigateTo(['Objects', elementType]);
    };

    const verifyElementCopy = (abb, name, status) => {
      cy.get('tr')
        .filter((index, row) => {
          const rowText = Cypress.$(row).text();
          return rowText.includes(abb) && rowText.includes(`${name} (duplicated)`) && rowText.includes(status);
        })
        .should('exist');
    };
  });
});
