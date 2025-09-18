import { Actions, ElementActions, Tabs } from '../../commands/elementHelpers';
import { createObject } from '../../requests/objects';

type TabConfig = {
  tab: Tabs;
  actions?: Actions[];
};

describe('Elements Details Tabs', () => {
  beforeEach(() => {
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' }).then(() => {
      cy.login();
      cy.acceptAllCookies();
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
    });
    cy.visitObject();
  });

  it('should verify actions in all scope tabs', () => {
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
