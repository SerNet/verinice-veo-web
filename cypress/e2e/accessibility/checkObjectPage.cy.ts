import { setupVeo } from '../../commands/setup';

export type Tabs = 'childObjects' | 'parentScopes' | 'links' | 'controls' | 'risks';

type TabConfig = {
  tab: Tabs;
};
const tabConfigs: TabConfig[] = [
  {
    tab: 'childObjects'
  },
  {
    tab: 'parentScopes'
  },
  {
    tab: 'links'
  },
  {
    tab: 'controls'
  },
  {
    tab: 'risks'
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
    tabConfigs.forEach(({ tab }) => {
      cy.visitObject();
      cy.get(`[data-component-name="object-details-${tab}-tab"]`).click();
      if (tab === 'links') return;
      // Open action menu
      cy.get('[data-component-name="object-details-actions-button"]').click();
      cy.get('[data-veo-test="dialog-card"]').should('be.visible');
      cy.checkAxeViolations('[data-veo-test="dialog-card"]');

      cy.get('.v-card-actions button')
        .contains(/cancel/i)
        .click();
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
