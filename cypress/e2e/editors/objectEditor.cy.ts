import { visitEditor } from '../../commands/navigation';
import { setupVeo } from '../../commands/setup';

function assertEditorPage() {
  cy.get('[data-component-name="breadcrumbs"]').contains('Objectschema editor', { matchCase: false });
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
    cy.get('[data-veo-test="import-object-schema"]').click();
    cy.wait(100);

    cy.getCustom('[data-veo-test="object-schema-select"]').should('be.visible');
    cy.wait(100);

    cy.getCustom('[data-veo-test="object-schema-select"]').click();

    cy.getCustom('div[role="listbox"]').should('be.visible').and('contain', status);

    cy.wait(100);

    cy.getCustom('div[role="listbox"]').find('[role="option"]').contains(status).first().click({ force: true });

    cy.getCustom('.v-overlay__content .v-field__input').should('contain', status);
  };
  it('should import an object editor', () => {
    visitEditor();
    cy.get('[data-veo-test="objectschema-item"]').click();
    selectMenuItem('scope');
    cy.get('[data-veo-test="import-object-schema-button"]').click();
    assertEditorPage();
  });
});
