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

import { useQuerySync } from '~/composables/api/utils/query';
import elementQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import type { VeoSearch } from '~/types/VeoSearch';
import type { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

type UseSearchParams<T> = {
  baseQueryParameters: Ref<T & { endpoint?: string; page?: number }>;
  search: Ref<VeoSearch[]>;
  queryDefinition?: any;
};
export const SEARCH_PREFIX = 'q_'; // Add search parameter prefix
export function useSearch<T>({ baseQueryParameters, search, queryDefinition }: UseSearchParams<T>) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const router = useRouter();
  const data = ref<IVeoPaginatedResponse<IVeoEntity[]> | undefined>();
  const isLoading = ref(false);
  const queryDef = queryDefinition || elementQueryDefinitions.queries.fetchAll;
  const requiresEndpoint = !queryDefinition;

  const routeSearch = computed(() => {
    const q = route.query.q as string;
    if (!q) return [];

    return q.split(/\s+/).map((part) => {
      const [searchFilter, ...termParts] = part.split('+');
      const term = decodeURIComponent(termParts.join('+') || '');
      return { searchFilter, term, operator: '=' } as VeoSearch;
    });
  });

  const updateQueryParams = async (searchParams: VeoSearch[]) => {
    const q = searchParams
      .filter((item) => item.searchFilter && item.term)
      .map((item) => `${item.searchFilter}+${encodeURIComponent(item.term)}`)
      .join(' ');

    const newQuery = { ...route.query, q: q || undefined };

    if (newQuery.q !== route.query.q) {
      await router.replace({ query: newQuery });
    }
  };

  const getApiParams = () =>
    Object.fromEntries(
      search.value.filter((item) => item.searchFilter && item.term).map((item) => [item.searchFilter, item.term])
    );

  watch(
    [baseQueryParameters, search],
    async () => {
      if (requiresEndpoint && !baseQueryParameters.value.endpoint) return;

      await updateQueryParams(search.value);

      try {
        isLoading.value = true;
        data.value = await useQuerySync(queryDef, {
          ...baseQueryParameters.value,
          ...getApiParams()
        });
      } catch (error) {
        if (config.public.debug) console.error('Search error:', error);
      } finally {
        isLoading.value = false;
      }
    },
    { deep: true, immediate: true }
  );

  watch(
    routeSearch,
    (newSearch) => {
      if (newSearch.length) search.value = newSearch;
    },
    { immediate: true }
  );

  return { data, isLoading };
}
