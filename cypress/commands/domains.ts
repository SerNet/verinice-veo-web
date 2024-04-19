import { IVeoDomain } from '../../composables/api/queryDefinitions/domains';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getVeoDomains: typeof getVeoDomains;
    }
  }
}

export type TCYVeoUnitNames = 'DS-GVO' | 'ITGS' | 'NIS2';
export interface ICYVeoDomain {
  name: string;
  id: string;
  targetUri: string;
}

/**
 * Get all available domains,
 * reduce them to a concise format,
 * write them into an env var.
 */
export function getVeoDomains(): Promise<ICYVeoDomain[]> {
  const savedDomains = Cypress.env('veoDomains');
  if (savedDomains) return savedDomains;

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
