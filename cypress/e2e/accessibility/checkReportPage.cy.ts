import { navigateToReport } from '../../commands/navigation';
import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Report', () => {
  before(() => {
    unitDetails = generateUnitDetails('Tutorials');
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
  });
  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);
    cy.handleLanguageBug();
  });
  after(() => cy.deleteUnit(unitDetails.name));
  it('check Accessibility in Report ', () => {
    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);

    // go to report page
    navigateToReport({ group: 'reports', entry: 'title' });
    cy.getCustom('.v-data-table').should('be.visible');
    cy.checkAxeViolations();
    cy.getCustom('.v-data-table__tr').first().click();
    cy.checkAxeViolations();
  });
});
