import { upperFirst } from 'lodash';
import { getRandomElementType } from '../../commands/utils';
import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;
describe('Create elements', () => {
  beforeEach(() => {
    unitDetails = generateUnitDetails('createElements');
    cy.login();
    cy.createUnit(unitDetails);

    cy.acceptAllCookies();
    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);
    cy.handleLanguageBug();
  });

  afterEach(() => cy.deleteUnit(unitDetails.name)); // Use the name from the unitDetails object to delete);

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  // number of elements to be created in each sub type
  const numOfElements = 1;

  it('should verify actions in all scope tabs', () => {
    cy.visit(
      `/${Cypress.env('dynamicTestData').unit.unitId}/domains/${Cypress.env('dynamicTestData').unit.domains[0].id}/scopes/-`,
      { failOnStatusCode: false }
    );
    cy.getCustom('button[data-component-name="create-object-button"]').click();
    cy.get('[data-veo-test="action-selection-nav-item"]').then(($items) => {
      const availableActions = $items.toArray().map((item) => item.innerText.trim());

      const actionsToTest = availableActions.slice(0, 2);

      cy.getCustom('button[data-component-name="create-object-button"]').click();

      actionsToTest.forEach((action) => {
        cy.getCustom('button[data-component-name="create-object-button"]').click();
        cy.containsCustom('[data-veo-test="action-selection-nav-item"]', action).click();
        cy.getCustom('[data-veo-test="dialog-card"]').as('container');
        cy.getCustom('@container').getCustom('[data-veo-test="dialog-title"]').invoke('text').should('contain', action);
        cy.getCustom('.v-card').find('.close-button').click();
      });
    });
  });

  for (const elementType of elementTypeList) {
    it('creates elements in ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });

      cy.selectFirstSubType(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        //Wait for the next element tab to load correctly
        cy.checkSubTypePage($subType[0].innerText);

        for (let i = 0; i < numOfElements; i++) {
          cy.getCustom('button[data-component-name="create-object-button"]').click();

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

          cy.containsCustom(elements.name).closest('tr').as('createdElement');

          cy.getCustom('@createdElement').then(($row) => {
            cy.wrap($row).containsCustom(elements.abb).should('be.visible');
            cy.wrap($row).containsCustom(elements.status).should('be.visible');
          });
        }
      });
    });
  }

  const createElement = (abbreviation: string, name: string, description: string, status: string) => {
    cy.getCustom('input[id="#/properties/abbreviation"]').type(abbreviation);
    cy.getCustom('input[id="#/properties/name"]').type(name);
    cy.getCustom('textarea[id="#/properties/description"]').type(description);

    selectMenuItem(status);

    cy.contains('Save').click();
  };

  const selectMenuItem = (status: string) => {
    new Cypress.Promise(() => {
      cy.getCustom('div[data-attribute-name="status"]').click();
      cy.getCustom('div[role="listbox"]').contains(status).click();
    });

    cy.getCustom('.v-overlay__content .v-field__input').contains(status);
  };

  const selectRandom = (list: string[]) => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  };
});
