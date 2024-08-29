import { getRandomElementType } from '../../commands/utils';
import { generateUnitDetails } from '../../support/setupHelpers';

describe('Create elements', { testIsolation: false }, () => {
  before(() => {
    generateUnitDetails();
    cy.login();
    cy.createUnit();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
    cy.selectUnit();
  });

  after(() => cy.deleteUnit());

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  // number of elements to be created in each sub type
  const numOfElements = 1;

  for (const elementType of elementTypeList) {
    it('creates elements in ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });

      cy.iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        //Wait for the next element tab to load correctly
        cy.checkSubTypePage($subType[0].innerText);

        for (let i = 0; i < numOfElements; i++) {
          cy.get('button[data-component-name="create-object-button"]').click();

          const elements = {
            name: elementType + '_' + $subType.text() + '_' + i,
            abb: 'Abb_' + i,
            des: 'Cypress testElement',
            status: selectRandom(['Archived', 'New', 'In progress', 'Released', 'For review'])
          };

          cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/${elementType.toLowerCase()}?scopes=**`).as(
            'createElement'
          );

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

  const selectRandom = (list: string[]) => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  };
});
