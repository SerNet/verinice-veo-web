import { getRandomElementType, waitForLoadersToDisappear, waitForPageToLoad } from '../../commands/utils';
import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';
let unitDetails: UnitDetails;

describe('Elements Overview Table', () => {
  before(() => {
    unitDetails = generateUnitDetails('checkElementsTable');
    cy.login();
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
  });

  after(() => cy.deleteUnit(unitDetails.name));

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('Check Items of ' + elementType, () => {
      cy.navigateTo({ group: 'objects', category: elementType });
      cy.selectFirstSubType(elementType, ($subType: JQuery<HTMLElement>) => {
        cy.wrap($subType).click();

        waitForPageToLoad();
        waitForLoadersToDisappear();

        cy.checkPagination(['name', 'status', 'updatedAt', 'updatedBy']);
      });
    });
  });
});
