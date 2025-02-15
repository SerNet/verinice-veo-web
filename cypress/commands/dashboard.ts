declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      testDashboardWidgets: typeof testDashboardWidgets;
      testEmptyDashboard: typeof testEmptyDashboard;
    }
  }
}

const gdpr_widgets = [
  { name: 'scope', numOfElements: 5 },
  { name: 'process', numOfElements: 3 },
  { name: 'asset', numOfElements: 3 },
  { name: 'person', numOfElements: 2 },
  { name: 'control', numOfElements: 1 },
  { name: 'incident', numOfElements: 1 },
  { name: 'document', numOfElements: 3 },
  { name: 'scenario', numOfElements: 1 }
];

export function testDashboardWidgets(widgets = gdpr_widgets) {
  /**
   * Test if widgets contain the assumed number of canvas elements
   * (Canvas is used to draw charts if elements/objects exist,
   * otherwise a regular div is used)
   */

  widgets.forEach((widget) => {
    cy.getCustom(`[data-veo-test="domain-dashboard-${widget.name}-widget"]`).as('widget');
    cy.getCustom('@widget').within((_w) => {
      cy.getCustom('canvas').should('have.length', widget.numOfElements);
    });
  });
}

export function testEmptyDashboard(widgets = gdpr_widgets) {
  widgets.forEach((widget) => {
    cy.getCustom(`[data-veo-test="domain-dashboard-${widget.name}-widget"]`).as('widget');
    cy.getCustom('@widget').within((_w) => {
      cy.getCustom('div.font-italic:contains("No objects available")').should('have.length', widget.numOfElements);
    });
  });
}
