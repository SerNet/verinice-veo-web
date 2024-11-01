/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      checkPagination: typeof checkPagination;
    }
  }
}

export function checkPagination(columnSelectors: string[] = ['name', 'status', 'updatedAt', 'updatedBy']) {
  const paginationRegex = /(\d+)-(\d+)\s+of\s+(\d+)/;

  function verifyAndNavigate(page, pages, itemsShown) {
    cy.get('.v-data-table-footer__info > div')
      .invoke('text')
      .then((footerText) => {
        const matches = footerText.match(paginationRegex);

        expect(matches).to.have.length(4);
        const startItem = parseInt(matches[1], 10);
        const endItem = parseInt(matches[2], 10);
        const totalItems = parseInt(matches[3], 10);

        expect(startItem).to.be.greaterThan(0);
        expect(endItem).to.be.at.least(startItem);
        expect(totalItems).to.be.greaterThan(0);

        const currentItemsShown = endItem - startItem + 1;

        cy.get('.v-data-table__tr')
          .should('have.length', currentItemsShown)
          .each(($row) => {
            cy.wrap($row).within(() => {
              columnSelectors.forEach((col) => {
                cy.get(`[data-veo-test="${col}"]`).should('not.be.empty');
              });
            });
          });

        if (page < pages) {
          cy.get('.v-pagination__next').click();
          verifyAndNavigate(page + 1, pages, itemsShown);
        }
      });
  }

  cy.get('.v-data-table-footer__info > div')
    .invoke('text')
    .then((footerText) => {
      const matches = footerText.match(paginationRegex);

      expect(matches).to.have.length(4);
      const startItem = parseInt(matches[1], 10);
      const endItem = parseInt(matches[2], 10);
      const totalItems = parseInt(matches[3], 10);

      const itemsShown = endItem - startItem + 1;
      const pages = Math.ceil(totalItems / itemsShown);

      verifyAndNavigate(1, pages, itemsShown);
    });
}
