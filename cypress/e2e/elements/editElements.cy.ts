import { getRandomElementType, getRandomString } from '../../commands/utils';
import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';
let unitDetails: UnitDetails;

describe('Edit elements', () => {
  before(() => {
    unitDetails = generateUnitDetails('editElements');
    cy.login();
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
    cy.selectDomain('DS-GVO');
  });

  after(() => cy.deleteUnit(unitDetails.name));

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('edit element in ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });

      cy.selectFirstSubType(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        cy.checkSubTypePage($subType[0].innerText);

        cy.getCustom('.v-data-table__tr').first().as('originalRow');
        cy.getCustom('@originalRow').click();

        const abbTyped = getRandomString();
        const nameTyped = 'AAAAAAAA';
        const descriptionTyped = getRandomString();

        const statusSelected = selectRandom(['Archived', 'New', 'In progress', 'Released', 'For review']);
        cy.getCustom('input[id="#/properties/abbreviation"]').clear().type(abbTyped);
        cy.getCustom('input[id="#/properties/name"]').clear().type(nameTyped);
        cy.getCustom('textarea[id="#/properties/description"]').clear().type(descriptionTyped);
        selectMenuItem(statusSelected);
        cy.wait(500);
        cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/domains/**`).as('editElement');
        cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**`).as('getElements');
        cy.contains('Save').click();
        cy.wait(['@editElement', '@getElements']).then((intercepts) => {
          expect(intercepts[0].response.statusCode).to.equal(200);
          expect(intercepts[1].response.statusCode).to.equal(200);
        });

        // Wait for veo to set form state from dirty to clean
        cy.wait(1000);

        cy.wrap($subType).click();

        cy.checkSubTypePage($subType[0].innerText);

        cy.contains('tr', abbTyped).as('rowWithElements');

        cy.getCustom('@rowWithElements').then(($row) => {
          const cells = $row.children('td');

          const texts = [];
          cells.each((_index, cell) => {
            if (Cypress.$(cell).text()) texts.push(Cypress.$(cell).text());
          });

          const abb = texts[1];
          const name = texts[2];
          const status = texts[3];

          expect(abb).to.equal(abbTyped);
          expect(name).to.equal(nameTyped);
          expect(status).to.equal(statusSelected);
        });

        cy.getCustom('@rowWithElements').click();

        cy.getCustom('textarea[id="#/properties/description"]')
          .should('be.visible')
          .invoke('val')
          .then((descriptionValue) => {
            expect(descriptionValue.toString().trim()).to.equal(descriptionTyped);
          });
      });
    });

    const selectMenuItem = (status: string) => {
      new Cypress.Promise(() => {
        cy.getCustom('div[data-attribute-name="status"]').click();
        cy.getCustom('div[role="listbox"]').contains(status).click();
      });
    };

    const selectRandom = (list: Array<any>) => {
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    };
  });
});
