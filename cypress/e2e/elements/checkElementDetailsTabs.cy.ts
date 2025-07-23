import { Actions, ElementActions, Tabs } from '../../commands/elementHelpers';
import { createObject } from '../../requests/objects';
import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

type TabConfig = {
  tab: Tabs;
  actions?: Actions[];
};

let unitDetails: UnitDetails;

describe('Elements Details Tabs', () => {
  before(() => {
    unitDetails = generateUnitDetails('ElementsDetailsTab');
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
  });

  afterEach(() => cy.deleteUnit());

  it('should verify actions in all scope tabs', () => {
    cy.handleLanguageBug();

    // Create test object
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

    // Test each tab configuration
    // Define tab configurations
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
        actions: ['Create Object', 'Select Object']
      }
    ];

    tabConfigs.forEach(({ tab, actions }) => {
      cy.get(`[data-component-name="object-details-${tab}-tab"]`).click();
      if (actions?.length) {
        ElementActions.verifyAndPerformTabActions(tab, actions);
      }
    });
  });
});
