/*
 * verinice.veo web
 * Copyright (C) 2024 jae
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { logStatus } from './utils';

export function applyCatalogItem({
  domainId = Cypress.env('dynamicTestData').unit.domains[0].id,
  unitId = Cypress.env('dynamicTestData').unit.unitId
} = {}) {
  // Get first catalog item
  return cy
    .veoRequest({
      endpoint: `domains/${domainId}/catalog-items?subType=CTL_Module&size=1`,
      method: 'GET'
    })

    .then((response) => {
      expect(response.status).to.equal(200);

      // Get incarnation descriptions for the first item
      return cy
        .veoRequest({
          endpoint: `units/${unitId}/domains/${domainId}/incarnation-descriptions?itemIds=${response.body.items[0].id}`,
          method: 'GET'
        })
        .then((response) => {
          logStatus('Getting incarnation descriptions', response);
          expect(response.status).to.equal(200);

          // Use this description to incarnate/apply catalog item
          return cy
            .veoRequest({
              endpoint: `units/${unitId}/incarnations`,
              method: 'POST',
              body: response.body
            })
            .then((response) => {
              logStatus('Applying catalog items', response);
              expect(response.status).to.equal(201);
              Cypress.env('dynamicTestData').modules = response.body;
              return response.body;
            });
        });
    });
}
