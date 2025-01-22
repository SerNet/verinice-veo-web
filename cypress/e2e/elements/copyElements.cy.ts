import { getRandomElementType } from '../../commands/utils';
import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';
let unitDetails: UnitDetails;

describe('Copy elements', () => {
  before(() => {
    unitDetails = generateUnitDetails('copyElements');
    cy.login();
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);
  });

  after(() => cy.deleteUnit(unitDetails.name));

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('copies element in ' + elementType, () => {
      cy.log(Cypress.env(unitDetails.name).unitId);
      cy.navigateTo({ group: 'objects', category: elementType });

      cy.selectFirstSubType(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        cy.checkSubTypePage($subType[0].innerText);

        cy.getCustom('.v-data-table__tr') // Adjust this selector if needed to be more specific
          .first()
          .as('originalRow');

        cy.getCustom('@originalRow').then(($row) => {
          cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/${elementType.toLowerCase()}`).as(
            'cloneElement'
          );
          cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**/${elementType.toLowerCase()}**`).as(
            'getClonedElement'
          );
          cy.wrap($row).find('[data-component-name="object-overview-clone-button"]').should('be.visible').click();
          const cells = $row.children();
          const texts = [];
          cells.each((_index, cell) => {
            texts.push(Cypress.$(cell).text());
          });

          const abb = texts[3];
          const name = texts[4];
          const status = texts[5];

          cy.wait('@cloneElement').its('response.statusCode').should('eq', 201);
          cy.wait('@getClonedElement').its('response.statusCode').should('eq', 200);
          verifyElementCopy(abb, name, status);
        });
      });
    });

    function verifyElementCopy(abb: string, name: string, status: string) {
      cy.getCustom('.v-data-table__tr')
        .filter((index, row) => {
          const rowText = Cypress.$(row).text();
          return rowText.includes(abb) && rowText.includes(`${name} (duplicated)`) && rowText.includes(status);
        })
        .should('exist');
    }
  });
});
