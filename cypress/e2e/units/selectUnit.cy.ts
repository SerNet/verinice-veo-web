import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

describe('Unit Selection Functionality', () => {
  before(() => {
    unitDetails = generateUnitDetails('selectUnit');
    cy.login();
    cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['IT-Grundschutz', 'DS-GVO'] });
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
    cy.handleLanguageBug();
  });

  after(() => cy.deleteUnit(unitDetails.name));

  it('should switch unit and verify unit selection', () => {
    const defaultUnitName = Cypress.env(unitDetails.name).name;
    cy.getCustom('[data-component-name="unit-select"] span')
      .invoke('text')
      .then((text: string) => {
        expect(text.trim()).to.equal(defaultUnitName);
        cy.getCustom('[data-component-name="breadcrumbs"]').contains(defaultUnitName);
      });

    cy.selectUnitFromDropdown(defaultUnitName);

    cy.getCustom('[data-component-name="unit-select"] span')
      .invoke('text')
      .then((newUnitText: string) => {
        expect(newUnitText.trim()).to.not.equal(defaultUnitName);
        cy.getCustom('[data-component-name="breadcrumbs"]').contains(newUnitText);
      });
  });
});
