import { getRandomString, getRandomElementType } from '../../commands/utils';

describe('Edit elements', () => {
  before(() => {
    cy.login();
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit();
    cy.selectDomain('DS-GVO');
  });

  after(() => cy.deleteUnit());

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('edit element in ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });

      cy.iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        cy.checkSubTypePage($subType[0].innerText);

        cy.get('.v-data-table__tr').first().as('originalRow');
        cy.get('@originalRow').click();

        const abbTyped = getRandomString();
        const nameTyped = 'AAAAAAAA';
        const descriptionTyped = getRandomString();

        const statusSelected = selectRandom(['Archived', 'New', 'In progress', 'Released', 'For review']);
        cy.get('input[id="#/properties/abbreviation"]').clear().type(abbTyped);
        cy.get('input[id="#/properties/name"]').clear().type(nameTyped);
        cy.get('textarea[id="#/properties/description"]').clear().type(descriptionTyped);
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

        cy.get('@rowWithElements').then(($row) => {
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

        cy.get('@rowWithElements').click();

        cy.get('textarea[id="#/properties/description"]')
          .should('be.visible')
          .invoke('val')
          .then((descriptionValue) => {
            expect(descriptionValue.toString().trim()).to.equal(descriptionTyped);
          });
      });
    });

    const selectMenuItem = (status: string) => {
      new Cypress.Promise(() => {
        cy.get('div[data-attribute-name="status"]').click();
        cy.get('div[role="listbox"]').contains(status).click();
      });
    };

    const selectRandom = (list: Array<any>) => {
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    };
  });
});
