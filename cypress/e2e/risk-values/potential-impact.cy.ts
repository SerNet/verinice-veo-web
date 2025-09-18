import { setupVeo } from '../../commands/setup';

const IMPACT_LEVELS = ['negligible', 'limited', 'considerable', 'existentially threatening'] as const;
const REASONS = ['Manual', 'Distributive', 'Cumulative'] as const;
const CRITERIA = ['Confidentiality', 'Integrity', 'Availability', 'Resilience'] as const;

describe('Process Risk Impact', () => {
  beforeEach(() => {
    setupVeo('Process-Risk-Impact', ['DS-GVO']).then(() => {
      const unitId = Cypress.env('dynamicTestData').unit.unitId;
      const domainId = Cypress.env('dynamicTestData').unit.domains[0].id;

      cy.login();
      cy.acceptAllCookies();

      cy.visit(`/${unitId}/domains/${domainId}/processes/PRO_DataProcessing`, { failOnStatusCode: false });

      // Wait for the page to load
      cy.getCustom('[data-component-name="breadcrumbs"]');

      // Open form to add a process
      cy.getCustom('[data-component-name="create-object-button"]').click();
    });
  });

  describe('Impact entry & levels', () => {
    it('allows selecting all impact levels per criterion', () => {
      IMPACT_LEVELS.forEach((level) => {
        cy.setImpactValue(0, level);
        cy.getCustom('[data-veo-test="form-potentialImpacts"]').eq(0).should('contain', level);
      });
    });

    it('shows all defined impact levels in the dropdown', () => {
      cy.getCustom('[data-veo-test="form-potentialImpacts"]').eq(0).click();
      IMPACT_LEVELS.forEach((level) => cy.contains(level).should('be.visible'));
    });
  });

  describe('Reason selection', () => {
    it('is enabled once an impact is set and shows all options', () => {
      cy.setImpactValue(0, 'negligible');

      // This prevents the test from trying to interact with a disabled element.
      cy.getCustom('[data-veo-test="form-potentialImpactReasons"]').eq(0).should('not.have.class', 'v-input--disabled');

      REASONS.forEach((reason) => {
        cy.setImpactReason(0, reason);
      });
    });

    it('defaults to Manual', () => {
      cy.setImpactValue(0, 'limited');
      cy.getCustom('[data-veo-test="form-potentialImpactReasons"]').eq(0).should('contain.text', 'Manual');
    });

    it('is disabled if no impact value is set', () => {
      cy.getCustom('[data-veo-test="form-potentialImpactReasons"]').eq(0).should('have.class', 'v-input--disabled');
    });
  });

  describe('Explanation field', () => {
    it('is editable when an impact is set', () => {
      cy.setImpactValue(0, 'negligible');
      cy.get('[title="Explanation"]').eq(0).type('Test explanation').should('have.value', 'Test explanation');
    });
  });

  describe('Multiple criteria consistency', () => {
    CRITERIA.forEach((criterion, index) => {
      it(`handles impact selection and effective value correctly for ${criterion}`, () => {
        cy.setImpactValue(index, 'limited');
        cy.verifyEffectiveValue(index, 'limited');
      });
    });
  });

  describe('Calculated vs Effective values', () => {
    it('shows calculated value in read-only field when inherited', () => {
      cy.getCustom('[data-veo-test="form-potentialImpactsCalculated"]')
        .eq(0)
        .should('have.class', 'v-input--disabled')
        .and('contain.text', 'Calculated (High water mark)');
    });

    it('uses calculated value in Effective if no user-defined value exists', () => {
      cy.getCustom('[data-veo-test="form-potentialImpactsCalculated"]')
        .eq(0)
        .find('.v-field__input')
        .invoke('text')
        .then((calculatedText: any) => {
          cy.getCustom('[data-veo-test="form-potentialImpactsEffective"]')
            .eq(0)
            .find('.v-field__input')
            .should('have.text', calculatedText);
        });
    });

    it('prefers user-defined value over calculated in Effective', () => {
      cy.setImpactValue(0, 'existentially threatening');
      cy.verifyEffectiveValue(0, 'existentially threatening');
    });

    it('uses user-defined value if no calculated value exists', () => {
      cy.setImpactValue(0, 'considerable');
      cy.verifyEffectiveValue(0, 'considerable');
    });
  });
});
