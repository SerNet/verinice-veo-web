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
        selectMenuItem(statusSelected);

        cy.intercept(
          'POST',
          `${Cypress.env('veoApiUrl')}/domains/**/${elementType.toLowerCase()}/evaluation?domain=**`,
          { times: 2 }
        ).as('updateForm');

        // Interact with the form
        cy.getCustom('input[id="#/properties/abbreviation"]').clear().type(abbTyped);
        cy.getCustom('input[id="#/properties/name"]').clear().type(nameTyped);
        cy.getCustom('textarea[id="#/properties/description"]').clear().type(descriptionTyped);

        // Wait for both requests and check status codes
        cy.wait(['@updateForm', '@updateForm']).then((intercepts) => {
          expect(intercepts[0].response.statusCode).to.equal(200);
          expect(intercepts[1].response.statusCode).to.equal(200);
        });

        cy.wait(500);
        cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/domains/**`).as('editElement');
        cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**`).as('getElements');
        cy.containsCustom('Save').click();
        cy.wait(['@editElement', '@getElements']).then((intercepts) => {
          expect(intercepts[0].response.statusCode).to.equal(200);
          expect(intercepts[1].response.statusCode).to.equal(200);
        });

        // Wait for veo to set form state from dirty to clean
        cy.wait(1000);

        cy.wrap($subType).click();

        cy.checkSubTypePage($subType[0].innerText);

        cy.containsCustom('tr', abbTyped).as('rowWithElements');

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

    const selectMenuItem = (status, retryCount = 0) => {
      if (retryCount > 5) {
        throw new Error('Max retries reached. Could not select the status.');
      }

      // Attempt to open the status menu and select the item
      cy.getCustom('input[id="#/properties/status"]').scrollIntoView().click({ force: true });

      cy.contains('[data-veo-test="object-select-item"]', status, { timeout: 2000 }).then(($el) => {
        if ($el.length > 0) {
          // If the menu item is found, click it
          cy.wrap($el).click();
          // Verify the status selection is visible
          cy.getCustom('[data-attribute-name="status"]').should('be.visible').contains(status);
        } else {
          // If the item is not found, try to reopen the menu and click the abbreviation field
          cy.getCustom('input[id="#/properties/abbreviation"]').scrollIntoView().click({ force: true });
          cy.getCustom('input[id="#/properties/status"]').scrollIntoView().click({ force: true });

          // Use Cypress.Promise.delay to wait briefly before retrying
          Cypress.Promise.delay(500).then(() => {
            // Recursively call the function, increasing the retry count
            selectMenuItem(status, retryCount + 1);
          });
        }
      });
    };

    const selectRandom = (list: Array<any>) => {
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    };
  });
});
