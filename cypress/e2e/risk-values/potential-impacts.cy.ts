import { visitProcess } from '../../commands/navigation';
import { setupVeo } from '../../commands/setup';

describe('Processes', () => {
  before(() => {
    // Setup with specific domain and wait for it to be ready
    setupVeo('Processes', ['DS-GVO']);
  });

  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
    visitProcess();
  });

  // waitForPageToLoad();
  //
  // // 3️⃣ Create a new process
  // cy.getCustom('[data-veo-test="create-object-button"]').should('be.visible').should('be.enabled').click();
  // cy.getCustom('[data-veo-test="select-subtype-data-processing"]').should('be.visible').should('be.enabled').click();
  //
  // waitForPageToLoad();
  //
  // // Wait for creation dialog
  // cy.contains('New Process').should('be.visible');
  //
  // // Open Risk Values section
  // cy.contains('Risk Values').should('be.visible').click();
  // waitForPageToLoad();
  //
  // cy.getCustom('[data-test-selector="specific-impact"]').should('exist');
  // });

  afterEach(() => {
    cy.deleteUnit();
  });

  describe('Process Risk Impact', () => {
    it('allows manual impact entry per criterion', () => {
      cy.getCustom('[data-test-selector="specific-impact"]').each(($select) => {
        cy.wrap($select).click();
        cy.contains('High').click();
        cy.wrap($select).should('contain', 'High');
      });
    });

    it('displays correct impact levels for each criterion', () => {
      cy.getCustom('[data-test-selector="specific-impact"]').first().click();
      ['Low', 'Medium', 'High'].forEach((level) => {
        cy.contains(level).should('be.visible');
      });
    });

    it('allows reason selection when impact exists', () => {
      cy.getCustom('[data-test-selector="specific-impact"]').first().click();
      cy.contains('High').click();

      cy.getCustom('[data-test-selector="specific-impact-explanation-text-field"]')
        .first()
        .should('be.enabled')
        .click();

      ['Kumulationseffekt', 'Verteilungseffekt', 'Manuell'].forEach((reason) => {
        cy.contains(reason).should('be.visible');
      });
    });

    it('sets Manual as default reason when impact is selected', () => {
      cy.getCustom('[data-test-selector="specific-impact"]').first().click();
      cy.contains('High').click();

      cy.getCustom('[data-test-selector="specific-impact-explanation-text-field"]')
        .first()
        .should('contain', 'Manuell');
    });

    it('disables reason selection when no impact is set', () => {
      cy.getCustom('[data-test-selector="specific-impact-explanation-text-field"]').first().should('be.disabled');
    });

    it('shows calculated value from linked object', () => {
      cy.getCustom('[data-test-selector="potential-impact"]').first().should('be.visible').should('not.be.empty');
    });

    it('displays calculated value as effective when no user-defined value exists', () => {
      cy.getCustom('[data-test-selector="potential-impact"]')
        .first()
        .invoke('text')
        .then((calculatedValue) => {
          cy.getCustom('[data-test-selector="effective-impact"]').first().should('contain', calculatedValue.trim());
        });
    });

    it('displays user-defined value as effective when both exist', () => {
      cy.getCustom('[data-test-selector="specific-impact"]').first().click();
      cy.contains('High').click();

      cy.getCustom('[data-test-selector="effective-impact"]').first().should('contain', 'High');
      cy.getCustom('[data-test-selector="potential-impact"]').first().should('not.be.empty');
    });

    it('displays user-defined value as effective when only user-defined exists', () => {
      cy.getCustom('[data-test-selector="specific-impact"]').first().click();
      cy.contains('Medium').click();

      cy.getCustom('[data-test-selector="effective-impact"]').first().should('contain', 'Medium');
      cy.getCustom('[data-test-selector="potential-impact"]').should('not.exist');
    });
  });
});
