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
import { Ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import { IVeoQueryTransformationMap, QueryOptions, STALE_TIME, useQuery } from './utils/query';
import { IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { IVeoDomain } from '~/types/VeoTypes';
import { useFetchUnit } from './units';

export interface IVeoFetchUnitDomainsParameters {
  unitId: string;
}

export const useFetchUnitDomains = (queryParameters: Ref<IVeoFetchUnitDomainsParameters>, queryOptions?: QueryOptions) => {
  // const fetchUnitQueryParameters = computed(() => ({ id: queryParameters.value.unitId }));
  // const fetchUnitQueryEnabled = computed(() => !!queryParameters.value.unitId);
  // const { data: unit } = useFetchUnit(fetchUnitQueryParameters, { enabled: fetchUnitQueryEnabled });

  // return useQuery<void, IVeoDomain[]>('domains', { url: '/api/domains/', onDataFetched: (result) => result.filter((domain) => unit.value.domains.some((unitDomain) => unitDomain.targetUri.includes(domain.id))) }, undefined, domainsQueryParameterTransformationMap.fetchAll, {
  //   ...queryOptions,
  //   staleTime: STALE_TIME.LONG,
  //   placeholderData: []
  // });
};
