import { visitEditor } from '../../commands/navigation';
import { setupVeo } from '../../commands/setup';

function assertEditorPage() {
  cy.get('[data-component-name="breadcrumbs"]').contains('Objectschema editor', { matchCase: false });
  cy.get('div').contains('Basic properties', { matchCase: false });
}

describe('Object Editor', () => {
  beforeEach(() => {
    setupVeo('ObjectEditor');
    cy.login();
    cy.acceptAllCookies();
  });

  const selectMenuItem = (status: string) => {
    cy.getCustom('[data-veo-test="object-schema-select"]').should('be.visible');
    cy.wait(100);

    cy.getCustom('[data-veo-test="object-schema-select"]').click();

    cy.getCustom('div[role="listbox"]').should('be.visible').and('contain', status);

    cy.wait(100);

    cy.getCustom('div[role="listbox"]').find('[role="option"]').contains(status).first().click({ force: true });

    cy.getCustom('.v-overlay__content .v-field__input').should('contain', status);
  };
  it('should open an object schema', () => {
    visitEditor();
    cy.get('[data-veo-test="objectschema-item"]').click();
    selectMenuItem('scope');
    cy.get('[data-veo-test="open-object-schema-button"]').click();
    assertEditorPage();
  });
});
