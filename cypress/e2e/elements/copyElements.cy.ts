import { getRandomElementType } from '../../commands/utils';

describe('Copy elements', () => {
  before(() => {
    cy.login();
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit();
  });

  after(() => cy.deleteUnit());

  const elementTypeList: string[] = ['Scope', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    const pluralizedElementType = elementType.toLowerCase() + (elementType === 'Process' ? 'es' : 's');

    it('copies element in ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });

      cy.iterateSubTypes(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        cy.checkSubTypePage($subType[0].innerText);

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

          const abb = texts[2];
          const name = texts[3];
          const status = texts[4];

          cy.wait('@cloneElement').its('response.statusCode').should('eq', 201);
          cy.wait('@getClonedElement').its('response.statusCode').should('eq', 200);

          verifyElementCopy(abb, name, status);
        });
      });
    });

    function verifyElementCopy(abb: string, name: string, status: string) {
      cy.get('tr')
        .filter((index, row) => {
          const rowText = Cypress.$(row).text();
          return rowText.includes(abb) && rowText.includes(`${name} (duplicated)`) && rowText.includes(status);
        })
        .should('exist');
    }
  });
});
