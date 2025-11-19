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
import type { Ref } from 'vue';

import domainQueryDefinitions from './queryDefinitions/domains';
import unitQueryDefinitions from './queryDefinitions/units';
import type { QueryOptions } from './utils/query';
import { useQuery } from './utils/query';

export interface IVeoFetchUnitDomainsParameters {
  unitId: string;
}

export const useFetchUnitDomains = (
  queryParameters: Ref<IVeoFetchUnitDomainsParameters>,
  queryOptions?: QueryOptions
) => {
  const fetchUnitQueryParameters = computed(() => ({
    id: queryParameters.value.unitId
  }));
  const fetchUnitQueryEnabled = computed(() => !!queryParameters.value.unitId && unref(queryOptions?.enabled));
  const { data: unit, isFetching: isFetchingUnits } = useQuery(
    unitQueryDefinitions.queries.fetch,
    fetchUnitQueryParameters,
    // @ts-ignore TODO #3066 does not exist
    { enabled: fetchUnitQueryEnabled }
  );

  const { data: domains, isFetching: isFetchingDomains } = useQuery(
    domainQueryDefinitions.queries.fetchDomains,
    undefined,
    queryOptions
  );

  const onSuccess = () => {
    if (!unit.value || !domains.value?.length) {
      return;
    }
    if (queryOptions?.onSuccess) {
      unref(queryOptions.onSuccess)?.(toReturn.data.value);
    }
  };

  watch(
    () => domains.value,
    () => onSuccess,
    { deep: true, immediate: true }
  );
  watch(
    () => unit.value,
    () => onSuccess,
    { deep: true, immediate: true }
  );

  const data = computed(() =>
    (domains.value || []).filter((domain) =>
      unit.value?.domains?.some((unitDomain) => unitDomain.targetUri.includes(domain.id))
    )
  );
  const isFetching = computed(() => isFetchingUnits.value || isFetchingDomains.value);

  const toReturn = {
    data,
    isFetching
  };

  return toReturn;
};
