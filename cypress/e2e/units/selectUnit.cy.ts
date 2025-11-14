import type { UnitDetails } from '../../support/setupHelpers';
import { generateUnitDetails } from '../../support/setupHelpers';
import { truncate } from 'lodash';

const crumbDefaultLength = 22;

let unitDetails_0: UnitDetails;
let unitDetails_1: UnitDetails;

describe('Unit Selection Functionality', () => {
  beforeEach(() => {
    unitDetails_0 = generateUnitDetails('selectUnit-0');
    unitDetails_1 = generateUnitDetails('selectUnit-1');
    cy.createUnit({ name: unitDetails_0.name, desc: unitDetails_0.desc, domains: ['IT-Grundschutz', 'DS-GVO'] });
    cy.createUnit(unitDetails_1);
    cy.login();
    cy.acceptAllCookies();
    cy.visitDashboard();
  });

  afterEach(() => cy.deleteTestUnits());

  it('should switch unit and verify unit selection', () => {
    const { testUnits } = Cypress.env('dynamicTestData');

    cy.getCustom('[data-component-name="unit-select"] span')
      .invoke('text')
      .then((text: string) => {
        expect(text.trim()).to.equal(testUnits[0].name);
        cy.getCustom('[data-component-name="breadcrumbs"]').contains(
          truncate(testUnits[0].name, { length: crumbDefaultLength })
        );
      });

    // Select the second test unit
    cy.getCustom('[data-component-name="unit-select"]')
      .click()
      .type(`{selectall}{backspace}${testUnits[1].name}{downArrow}{enter}`);

    cy.getCustom('[data-component-name="unit-select"] span')
      .invoke('text')
      .then((newUnitText: string) => {
        expect(newUnitText.trim()).to.equal(testUnits[1].name);
        expect(newUnitText.trim()).to.not.equal(testUnits[0].name);
        cy.getCustom('[data-component-name="breadcrumbs"]').contains(
          truncate(testUnits[1].name, { length: crumbDefaultLength })
        );
      });
  });
});
