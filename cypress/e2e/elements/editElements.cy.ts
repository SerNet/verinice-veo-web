import { getRandomString } from '../../commands/utils';

describe('Edit elements', () => {
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
    it.skip('edit element in ' + elementType, () => {
      cy.handleLanguageBug();
      cy.navigateToDeprecated(['Objects', elementType]);

      iterateSubTypes(elementType, ($subType) => {
        cy.wrap($subType).click();
        cy.wait(100);

        cy.get('.v-data-table__tr').first().as('originalRow');
        cy.get('@originalRow').click();

        const abbTyped = getRandomString();
        const nameTyped = getRandomString();
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
        cy.wait(1000);

        cy.wrap($subType).click();
        cy.wait(1000);
        cy.contains('tr', abbTyped).as('rowWithElements');

        cy.get('@rowWithElements').then(($row) => {
          const cells = $row.children('td');

          const texts = [];
          cells.each((index, cell) => {
            if (Cypress.$(cell).text()) texts.push(Cypress.$(cell).text());
          });

          const abb = texts[0];
          const name = texts[1];
          const status = texts[2];

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

    const selectRandom = (list) => {
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    };
  });
});
