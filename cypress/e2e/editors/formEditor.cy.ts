import { visitEditor } from '../../commands/navigation';
import { setupVeo } from '../../commands/setup';

describe('Form Editor', () => {
  beforeEach(() => {
    setupVeo('FormEditor');
    cy.login();
    cy.acceptAllCookies();
  });

  it('should create a form editor', () => {
    visitEditor();
    cy.get('[data-veo-test="formschema-item"]').click();
    cy.get('[data-veo-test="dialog-card"]').within(() => {
      cy.get('[data-veo-test="create-form-schema"]').click();
      cy.get('[data-veo-test="form-schema-name"]')
        .click()
        .within(() => {
          cy.get('input').type('test');
        });
    });
    cy.get('[data-veo-test="form-schema-context-select"]').click();
    cy.getCustom('.v-overlay__content div[role="listbox"]').contains('Object view').click();
    cy.get('[data-veo-test="form-schema-type-select"]').click();
    cy.getCustom('.v-overlay__content div[role="listbox"]').contains('scope').click();
    cy.get('[data-veo-test="dialog-card"]').within(() => {
      cy.get('[data-veo-test="form-schema-subtype-select"]').click();
    });
    cy.getCustom('.v-overlay__content div[role="listbox"] div[role="option"]').first().click();
    cy.get('[data-veo-test="form-schema-next-btn"]').click();
    cy.get('[data-component-name="breadcrumbs"]').contains('Formschema editor', { matchCase: false });
    assertEditorPage();
  });

  it('should import a form editor', () => {
    visitEditor();
    cy.intercept('GET', `${Cypress.env('veoFormsApiUrl')}/?domainId=**`).as('getFormSchemas');
    cy.get('[data-veo-test="formschema-item"]').click();
    cy.wait('@getFormSchemas').its('response.statusCode').should('eq', 200);
    cy.get('[data-veo-test="dialog-card"]').within(() => {
      cy.get('[data-veo-test="import-form-schema"]').click();
      cy.get('[data-veo-test="form-schema-select"]').click();
    });
    const listbox = '.v-overlay__content:visible [role="listbox"]';
    cy.getCustom(listbox)
      .contains('[role="option"]', /^Scope$/)
      .scrollIntoView();
    cy.getCustom(listbox)
      .contains('[role="option"]', /^Scope$/)
      .should('be.visible')
      .click();
    cy.get('[data-veo-test="form-schema-next-btn"]').click();
    cy.get('[data-component-name="breadcrumbs"]').contains('Formschema editor', { matchCase: false });
    assertEditorPage();
  });
});

function assertEditorPage() {
  cy.get('div').contains('Available controls', { matchCase: false });
  cy.get('div').contains('Currently used controls', { matchCase: false });
  cy.get('div').contains('Preview', { matchCase: false });
}
