import { createObject } from '../../requests/objects';
import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';
import { Actions, ElementActions, Tabs } from '../elements/elementHelpers';

let unitDetails: UnitDetails;
type TabConfig = {
  tab: Tabs;
  actions?: Actions[];
};
const tabConfigs: TabConfig[] = [
  {
    tab: 'parentScopes',
    actions: ['Create scope', 'Select scope']
  },
  {
    tab: 'links'
  },
  {
    tab: 'risks',
    actions: ['Create risk']
  },
  {
    tab: 'childScopes',
    actions: ['Create scope', 'Select scope']
  },
  {
    tab: 'childObjects',
    actions: ['Create object', 'Select object']
  }
];
const SideBarActions = ['view', 'toc', 'history', 'messages'];
describe('check Accessibility', () => {
  beforeEach(() => {
    unitDetails = generateUnitDetails('ElementsDetailsTab');
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
    cy.injectAxe();
  });
  it('check Accessibility in object', () => {
    createObject({
      objectData: {
        owner: {},
        riskDefinition: 'DSRA',
        name: 'test-object-name',
        objectType: 'scope',
        objectTypePlural: 'scopes',
        subType: 'SCP_Scope',
        subTypePlural: 'Scopes',
        status: 'NEW'
      }
    });

    cy.visitObject();
    cy.checkAxeViolations();
  });
  // Test each tab configuration
  it('checks accessibility on detail tabs', () => {
    tabConfigs.forEach(({ tab, actions }) => {
      createObject({
        objectData: {
          owner: {},
          riskDefinition: 'DSRA',
          name: `test-object-${tab}`,
          objectType: 'scope',
          objectTypePlural: 'scopes',
          subType: 'SCP_Scope',
          subTypePlural: 'Scopes',
          status: 'NEW'
        }
      });
      cy.visitObject();
      cy.get(`[data-component-name="object-details-${tab}-tab"]`).click();
      cy.checkAxeViolations();

      if (actions?.length) {
        ElementActions.verifyAndPerformTabActions(tab, actions);
      }
    });
  });
  // Test sidebar tabs
  it('checks accessibility on sidebar tabs', () => {
    SideBarActions.forEach((tab) => {
      createObject({
        objectData: {
          owner: {},
          riskDefinition: 'DSRA',
          name: `test-object-${tab}`,
          objectType: 'scope',
          objectTypePlural: 'scopes',
          subType: 'SCP_Scope',
          subTypePlural: 'Scopes',
          status: 'NEW'
        }
      });
      cy.visitObject();
      cy.get(`[data-component-name="object-form-${tab}-tab"]`).click();
      cy.checkAxeViolations();
    });
  });
});
