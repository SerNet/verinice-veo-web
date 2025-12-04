import { setupVeo } from '../../commands/setup';

export type Tabs = 'childObjects' | 'parentScopes' | 'links' | 'controls' | 'risks';
export type Actions =
  | 'Create scope'
  | 'Select scope'
  | 'Create Object'
  | 'Select Object'
  | 'Model Modules'
  | 'Create risk';

type TabConfig = {
  tab: Tabs;
  actions?: Actions[];
};
const tabConfigs: TabConfig[] = [
  {
    tab: 'childObjects',
    actions: ['Create Object', 'Select Object']
  },
  {
    tab: 'parentScopes',
    actions: ['Create scope', 'Select scope']
  },
  {
    tab: 'links'
  },
  {
    tab: 'controls',
    actions: ['Model Modules']
  },
  {
    tab: 'risks',
    actions: ['Create risk']
  }
];
const SideBarActions = ['view', 'toc', 'history', 'messages'];
describe('checks Accessibility', () => {
  beforeEach(() => {
    setupVeo('Object');
  });

  it('checks accessibility on the object detail page', () => {
    cy.visitObject();
    cy.checkAxeViolations();
  });
  // Test each tab configuration
  it('checks accessibility in each tab of the object detail page', () => {
    tabConfigs.forEach(({ tab, actions }) => {
      cy.visitObject();
      cy.get(`[data-component-name="object-details-${tab}-tab"]`).click();
      if (actions?.length) {
        actions.forEach((action) => {
          // Open action menu
          cy.get('[data-component-name="object-details-actions-button"]').click();

          cy.containsCustom('[data-veo-test="action-selection-nav-item"]', action).click();

          cy.get('[data-veo-test="dialog-card"]').should('be.visible');
          cy.checkAxeViolations('[data-veo-test="dialog-card"]');

          cy.get('.v-card-actions button')
            .contains(/cancel/i)
            .click();
        });
      }
    });
  });
  // Test sidebar tabs in object detail page
  it('checks accessibility in each tab of the sidebar in object detail page', () => {
    SideBarActions.forEach((tab) => {
      cy.visitObject();
      cy.get(`[data-component-name="object-form-${tab}-tab"]`).click();
      cy.checkAxeViolations();
    });
  });
});
