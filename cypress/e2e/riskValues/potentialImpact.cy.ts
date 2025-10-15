import { setupVeo } from '../../commands/setup';

const IMPACT_LEVELS = ['Negligible', 'Limited', 'Considerable', 'Existentially threatening'] as const;
const REASONS = ['Manual', 'Distributive', 'Cumulative'] as const;
const CRITERIA = ['Confidentiality', 'Integrity', 'Availability', 'Resilience'] as const;

describe('Process Risk Impact', () => {
  beforeEach(() => {
    setupVeo('Process-Risk-Impact', ['DS-GVO']).then(() => {
      const { unitId, domains } = Cypress.env('dynamicTestData').unit;
      const domainId = domains[0].id;

      cy.visit(`/${unitId}/domains/${domainId}/processes/PRO_DataProcessing`, { failOnStatusCode: false });
      cy.getCustom('[data-veo-test="create-object-button"]').click();
      cy.getCustom('[data-veo-test="base-dialog"]').should('be.visible');
    });
  });

  describe('Impact entry & levels', () => {
    it('should allow selecting all impact levels per criterion', () => {
      IMPACT_LEVELS.forEach((level) => {
        cy.setImpactValue(level);
        cy.getCustom('[data-veo-test="form-potentialImpacts"]').should('contain', level);
      });
    });

    it('should display all defined impact levels in the dropdown', () => {
      cy.getCustom('[data-veo-test="form-potentialImpacts"]').first().click();
      IMPACT_LEVELS.forEach((level) => cy.contains(level).should('be.visible'));
    });
  });

  describe('Reason selection', () => {
    it('should be disabled if no impact value is set', () => {
      cy.getCustom('[data-veo-test="form-potentialImpactReasons"] input').should('be.disabled');
    });

    it('should be enabled once an impact is set and show all available options', () => {
      REASONS.forEach((reason) => {
        it(`should allow selecting reason: ${reason}`, () => {
          cy.setImpactValue(IMPACT_LEVELS[0]);
          cy.getCustom('[data-veo-test="form-potentialImpactReasons"]')
            .first()
            .scrollIntoView()
            .should('be.visible')
            .click();
          cy.get('.v-overlay-container .v-list').contains('.v-list-item-title', reason).should('be.visible').click();
          cy.getCustom('[data-veo-test="form-potentialImpactReasons"]').eq(0).should('contain.text', reason);
        });
      });
    });

    it('should default to "Manual" as the initial reason', () => {
      cy.setImpactValue(IMPACT_LEVELS[0]);
      cy.getCustom('[data-veo-test="form-potentialImpactReasons"]').should('contain.text', 'Manual');
    });
  });

  describe('Explanation field', () => {
    it('should be editable when an impact is set', () => {
      cy.setImpactValue(IMPACT_LEVELS[0]);
      cy.get('[title="Explanation"]').eq(0).type('Test explanation').should('have.value', 'Test explanation');
    });
  });

  describe('Multiple criteria consistency', () => {
    CRITERIA.forEach((criterion, index) => {
      it(`should handle impact selection and effective value correctly for ${criterion}`, () => {
        cy.setImpactValue(IMPACT_LEVELS[0], index);
        cy.getCustom('[data-veo-test="form-potentialImpactsEffective"]').should('contain.text', IMPACT_LEVELS[0]);
      });
    });
  });
});
