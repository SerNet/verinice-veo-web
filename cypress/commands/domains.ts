import { IVeoDomain } from '../../composables/api/queryDefinitions/domains';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getVeoDomains: typeof getVeoDomains;
      selectRandomDomain: typeof selectRandomDomain;
      getSelectedDomain: typeof getSelectedDomain;
      selectDomain: typeof selectDomain;
    }
  }
}

export type TCYVeoUnitNames = 'DS-GVO' | 'ITGS' | 'NIS2';
export interface ICYVeoDomain {
  name: string;
  id: string;
  targetUri: string;
}

export function selectDomain(domainName: string): void {
  cy.get('[data-veo-test="domain-select"] .v-autocomplete__menu-icon').click({ force: true });
  cy.get('[data-veo-test="domain-selection-nav-item"]').should('be.visible');
  cy.wait(500);
  cy.get('[data-veo-test="domain-selection-nav-item"]').each(($el) => {
    if ($el.text().trim() === domainName) {
      cy.wrap($el).click();
      return false; // Exit the .each() loop earlyc
    }
  });
}

export function selectRandomDomain(): void {
  cy.get('[data-veo-test="domain-select"] .v-autocomplete__menu-icon').click({ force: true });
  cy.get('[data-veo-test="domain-selection-nav-item"]').should('be.visible');
  cy.wait(500);
  cy.get('[data-veo-test="domain-selection-nav-item"]').then(($options) => {
    const randomIndex = Math.floor(Math.random() * Cypress.env('unitDetails').domains.length);
    cy.wrap($options[randomIndex]).click();
  });
}

export function getSelectedDomain(): Cypress.Chainable<string> {
  return cy.get('.v-list-item--active .v-list-item-title').invoke('text');
}

/**
 * Get all available domains,
 * reduce them to a concise format,
 * write them into an env var.
 */
export function getVeoDomains(): Promise<ICYVeoDomain[]> {
  cy.log('Fetching domains...');

  return cy
    .veoRequest({
      url: '/api/domains',
      method: 'GET'
    })
    .then((domains: IVeoDomain[]) => {
      const reducedDomains = domains.reduce(
        (acc: ICYVeoDomain[], cur: IVeoDomain) => [...acc, { name: cur.name, id: cur.id, targetUri: cur._self }],
        []
      );

      Cypress.env('veoDomains', reducedDomains);
      return reducedDomains;
    });
}
