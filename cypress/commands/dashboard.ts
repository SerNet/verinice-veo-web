import { IVeoDomain } from '../../composables/api/queryDefinitions/domains';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      testDashboardWidgets: typeof testDashboardWidgets;
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
    cy.get(`[data-veo-test="domain-dashboard-${widget.name}-widget"]`).as('widget');
    cy.get('@widget').within((_w) => {
      cy.get('canvas').should('have.length', widget.numOfElements);
    });
  });
}
