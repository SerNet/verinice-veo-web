import { setupVeo } from '../../commands/setup';

describe('Scope Details Tabs', () => {
  beforeEach(() => {
    setupVeo('detailsTabs');
    cy.visitObject();
  });

  const tabConfigs = [
    {
      tab: 'childScopes',
      action: 'Create scope'
    },
    {
      tab: 'childObjects',
      action: 'Create Object'
    },
    {
      tab: 'parentScopes',
      action: 'Create scope'
    },
    {
      tab: 'links'
    },
    {
      tab: 'controls',
      action: 'Model Modules'
    },
    {
      tab: 'risks',
      action: 'Create risk'
    }
  ];

  it('should verify actions in all scope tabs', () => {
    tabConfigs.forEach(({ tab, action }) => {
      cy.getCustom(`[data-component-name="object-details-${tab}-tab"]`).scrollIntoView().should('be.visible').click();
      if (tab === 'links') {
        // Links tab button is disabled
        cy.get('[data-veo-test="object-details-actions-button"]').should('be.disabled');
      } else {
        cy.getCustom('[data-component-name="object-details-actions-button"]').should('be.visible').click();
        cy.getCustom('[data-veo-test="loadedDataTable"]').should('be.visible');
        cy.getCustom('[data-veo-test="object-action-menu-list"]')
          .contains('[data-veo-test="action-selection-nav-item"]', action)
          .should('be.visible');
      }
    });
  });
});
