import { getRandomElementType, waitForLoadersToDisappear, waitForPageToLoad } from '../../commands/utils';

describe('Elements Overview Table', () => {
  before(() => {
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' });
  });
  beforeEach(() => {
    cy.login();
    cy.goToUnitDashboard();
  });

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('Check Items of ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });
      cy.selectFirstSubType(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        waitForPageToLoad();
        waitForLoadersToDisappear();
        cy.get('[data-veo-test="loadedDataTable"]').find('tbody').should('be.visible');
        cy.checkPagination(['name', 'status', 'updatedAt', 'updatedBy']);
      });
    });
  });
});
