/*
 * verinice.veo web
 * Copyright (C) 2024 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import { useRouter, useRoute } from 'vue-router';
import { ROUTE_NAME as CATALOGS_CATALOG_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/catalog/index.vue';
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';

export function useNavigation() {
  const router = useRouter();
  const route = useRoute();

  const validDomainRoute = computed(() => !!route.params.domain);
  const validUnitRoute = computed(() => !!route.params.unit);

  const navigateToCatalog = (type: string, subType: string) => {
    if (validDomainRoute.value && validUnitRoute.value) {
      router.push({
        name: CATALOGS_CATALOG_ROUTE_NAME,
        params: {
          domain: route.params.domain,
          unit: route.params.unit
        },
        query: {
          type: type ?? 'all',
          subType: subType ?? 'all'
        }
      });
    }
  };

  const navigateToObject = (objectType: string, subType?: string) => {
    if (validDomainRoute.value && validUnitRoute.value) {
      router.push({
        name: OBJECT_OVERVIEW_ROUTE_NAME,
        params: {
          domain: route.params.domain,
          unit: route.params.unit,
          objectType: objectType,
          subType: '-'
        }
      });
    }
  };

  return {
    navigateToCatalog,
    navigateToObject
  };
}
