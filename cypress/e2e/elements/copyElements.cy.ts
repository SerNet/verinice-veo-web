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
    cy.selectDomain('DS-GVO');
  });

  after(() => cy.deleteUnit());

  const elementTypeList: string[] = ['Scope', 'Process', 'Asset', 'Person', 'Incident', 'Document', 'Scenario'];

  elementTypeList.forEach((elementType) => {
    const pluralizedElementType = elementType.toLowerCase() + (elementType === 'Process' ? 'es' : 's');

    it('copies element in ' + elementType, () => {
      handleLanguageBug();
      navigateToElementType(elementType);

      iterateSubTypes(elementType, ($subType) => {
        cy.wrap($subType).click();
        cy.wait(100);

        selectOriginalRow();

        cy.get('@originalRow').then(($row) => {
          interceptCloneRequest(pluralizedElementType);
          cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**/${pluralizedElementType}**`).as(
            'getClonedElement'
          );

          cloneElement($row);
          const cells = $row.children();
          let texts = [];
          cells.each((index, cell) => {
            texts.push(Cypress.$(cell).text());
          });

          let abb = texts[1];
          let name = texts[2];
          let status = texts[3];

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

    const selectOriginalRow = () => {
      cy.get('.v-data-table__tr') // Adjust this selector if needed to be more specific
        .first()
        .as('originalRow');
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

    const interceptCloneRequest = (pluralizedElementType) => {
      cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/${pluralizedElementType}`).as('cloneElement');
    };

    const cloneElement = ($row) => {
      cy.wrap($row).find('[data-component-name="object-overview-clone-button"]').should('be.visible').click();
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
