describe('Create elements', () => {
  before(() => {
    cy.login();
    cy.createUnit();
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

  const numOfElements = 1;

  for (const elementType of elementTypeList) {
    it('creates elements in ' + elementType, () => {
      //Workaround for language bug
      cy.get('nav[data-component-name="primary-navigation"]').then((body) => {
        if (!body.find('div[data-component-name="objects-nav-item"]:contains("Objects")').length) {
          cy.languageTo('English');
        }
      });

      cy.navigateTo(['Objects', elementType]);

      cy.contains('div[sub-group="true"] > div', new RegExp(`^${elementType}$`))
        .should('be.visible')
        .parent()
        .find('a')
        .each(($subType) => {
          if ($subType.text() == 'All') return;

          cy.wrap($subType).click();

          //Wait for the next element tab to load correctly
          cy.wait(100);

          for (let i = 0; i < numOfElements; i++) {
            cy.get('button[data-component-name="create-object-button"]').click();

            const elements = {
              name: elementType + '_' + $subType.text() + '_' + i,
              abb: 'Abb_' + i,
              des: 'Cypress testElement',
              status: selectRandom(['Archived', 'New', 'In progress', 'Released', 'For review'])
            };

            let extra = 's';
            if (elementType === 'Process') extra = 'es';

            cy.intercept(
              'POST',
              `${Cypress.env('veoApiUrl')}/domains/**/${elementType.toLocaleLowerCase() + extra}?scopes=**`
            ).as('createElement');

            createElement(elements.abb, elements.name, elements.des, elements.status);

            cy.wait(['@createElement']).its('response.statusCode').should('eq', 201);

            veoAlertDismiss();

            cy.contains(elements.name).closest('tr').as('tmp');

            cy.get('@tmp').then(($row) => {
              cy.wrap($row).contains(elements.abb).should('be.visible');
              cy.wrap($row).contains(elements.status).should('be.visible');
            });
          }
        });
    });
  }

  const veoAlertDismiss = () => {
    cy.get('div[role="alert"][params="[object Object]"]').click();
  };

  const createElement = (abbreviation: string, name: string, description: string, status: string) => {
    cy.get('input[id="#/properties/abbreviation"]').type(abbreviation);
    cy.get('input[id="#/properties/name"]').type(name);
    cy.get('textarea[id="#/properties/description"]').type(description);

    selectMenuItem(status);

    cy.contains('Save').click();
  };

  const selectMenuItem = (status: string) => {
    new Cypress.Promise(() => {
      cy.get('div[data-attribute-name="status"]').click();
      cy.get('div[role="listbox"]').contains(status).click();
    });

    cy.get('.v-overlay__content .v-field__input').contains(status);
  };

  const selectRandom = (list) => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  };
});
