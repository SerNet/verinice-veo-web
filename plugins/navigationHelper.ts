/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import { defineNuxtPlugin } from '@nuxtjs/composition-api';
import { separateUUIDParam } from '~/lib/utils';
import LocalStorage from '~/util/LocalStorage';

export default defineNuxtPlugin(async (context) => {
  const clearLastVisitData = () => {
    LocalStorage.lastUnit = null;
    LocalStorage.lastDomain = null;
  };

  if (context.route.path === '/' && LocalStorage.lastUnit && LocalStorage.lastDomain) {
    try {
      console.log('Bla123');
      const domains = await context.$api.domain.fetchUnitDomains(LocalStorage.lastUnit);
      console.log(domains, LocalStorage.lastDomain);
      if (domains.find((domain) => domain.id === LocalStorage.lastDomain)) {
        console.log('Bla456');
        context.app.router?.push({
          name: 'unit-domains-domain',
          params: {
            unit: LocalStorage.lastUnit,
            domain: LocalStorage.lastDomain
          }
        });
      } else {
        clearLastVisitData();
      }

      // Usually gets thrown if the unit doesn't exist
    } catch (e) {
      clearLastVisitData();
    }
  }

  // Update last unit and last domain every time the route changes
  context.app.router?.afterEach((to, _from) => {
    const currentRouteUnitId = separateUUIDParam(to.params.unit).id;
    const currentRouteDomainId = separateUUIDParam(to.params.domain).id;

    if (currentRouteUnitId && LocalStorage.lastUnit !== currentRouteUnitId) {
      LocalStorage.lastUnit = currentRouteUnitId;
    }

    if (currentRouteDomainId && LocalStorage.lastDomain !== currentRouteDomainId) {
      LocalStorage.lastDomain = currentRouteDomainId;
    }
  });
});
