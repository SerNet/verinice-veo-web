// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mock authorization by visiting pages
     * @example authorize all tests automatically -> before(() => { cy.auth() })
     */
    auth(): void;

    /**
     * Custom command to start dragging the element (often used before cy.get('.dropzone').drop() to drop the element)
     * @example cy.get('.someelement').drag()
     */
    drag(): JQuery<HTMLElement>;

    /**
     * Custom command to end dragging the element (often used after cy.get('.someelement').drag() to start dragging the element)
     * @example cy.get('.dropzone').drop()
     */
    drop(): JQuery<HTMLElement>;

    /**
     * Custom command to extend .toMatchSnapshot() functionality by removing dynamic attributes from HTML
     * @example cy.get('.vf-wrapper').toMatchHtmlSnapshot()
     */
    toMatchHtmlSnapshot(
      options?: Partial<{
        ignoreExtralFields: boolean;
        ignoreExtraArrayItems: boolean;
        normalizeJson: boolean;
        replace: any;
        name: string;
      }>
    ): Cypress.Chainable<null>;

    /**
     * Custom command to navigate through app by URL
     * @example cy.goTo('/editor/objectschema')
     */
    goTo(path: string): Promise<void>;

    /**
     * Custom command to define OSE used intercepts
     * @example cy.defineOSEIntercepts()
     */
    defineEditorIntercepts(): void;
  }
}
