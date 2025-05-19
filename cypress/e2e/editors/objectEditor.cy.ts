import { visitEditor } from '../../commands/navigation';
import { setupVeo } from '../../commands/setup';

function assertEditorPage() {
  cy.get('[data-component-name="breadcrumbs"]').contains('Objektschema editor', { matchCase: false });
  cy.get('div').contains('Basic properties', { matchCase: false });
}

describe('Object Editor', () => {
  before(() => {
    setupVeo('ObjectEditor');
  });
  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
  });
  after(() => cy.deleteUnit());

  it('should set up the editor to create a new object schema', () => {
    visitEditor();
    cy.get('[data-veo-test="objectschema-item"]').click();
    cy.get('[data-veo-test="dialog-card"]').within(() => {
      cy.get('[data-veo-test="create-object-schema"]').click();
      cy.get('[data-veo-test="object-schema-type"]')
        .click()
        .within(() => {
          cy.get('input').type('test');
        });

      cy.get('[data-veo-test="object-schema-description"]')
        .click()
        .within(() => {
          cy.get('input').type('test');
        });
      cy.get('[data-veo-test="create-object-schema-button"]').click();
    });
    assertEditorPage();
  });
  const selectMenuItem = (status: string) => {
    new Cypress.Promise(() => {
      cy.get('[data-veo-test="import-object-schema"]').click();
      cy.get('[data-veo-test="object-schema-select"]').click();
      cy.getCustom('div[role="listbox"]').contains(status).click();
    });

    cy.getCustom('.v-overlay__content .v-field__input').contains(status);
  };
  it('should import an object editor', () => {
    visitEditor();
    cy.get('[data-veo-test="objectschema-item"]').click();
    selectMenuItem('scope');
    cy.get('[data-veo-test="import-object-schema-button"]').click();
    assertEditorPage();
  });
});
