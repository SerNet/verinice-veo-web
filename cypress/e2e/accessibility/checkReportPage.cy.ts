import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Report', () => {
  beforeEach(() => {
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
  afterEach(() => cy.deleteUnit(unitDetails.name));
  it('checks Accessibility in Report page', () => {
    // go to report page
    cy.url().then((fullUrl) => {
      const url = new URL(fullUrl);
      cy.visit(`${url.pathname}/reports`, { failOnStatusCode: false });
    });
    cy.getCustom('.v-data-table').should('be.visible');
    cy.checkAxeViolations();
  });
});
