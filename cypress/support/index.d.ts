declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mock authorization by visiting pages
     * @example authorize all tests automatically -> before(() => { cy.auth() })
     */
    auth(): void

    /**
     * Custom command to start dragging the element (often used before cy.get('.dropzone').drop() to drop the element)
     * @example cy.get('.someelement').drag()
     */
    drag(): JQuery<HTMLElement>
    /**
     * Custom command to end dragging the element (often used after cy.get('.someelement').drag() to start dragging the element)
     * @example cy.get('.dropzone').drop()
     */
    drop(): JQuery<HTMLElement>
  }
}
