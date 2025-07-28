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
import type { VeoSearch, VeoSearchQueryParameters, VeoSearchFilters } from '~/types/VeoSearch';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

type UseSearchParams<T> = {
  baseQueryParameters: Ref<T & { endpoint?: string; page?: number }>;
  search: Ref<VeoSearch[]>;
  queryDefinition?: any;
};

type VeoSearchResponse = IVeoPaginatedResponse<IVeoEntity[]> | undefined;

type SearchKey = 'abbreviation' | 'displayName' | 'name';

export function useSearch<T>({ baseQueryParameters, search, queryDefinition }: UseSearchParams<T>): {
  data: Ref<VeoSearchResponse>;
  isLoading: Ref<boolean>;
} {
  const config = useRuntimeConfig();
  const data = ref<VeoSearchResponse>();
  const isLoading = ref(false);
  const _queryDefinition = queryDefinition ? queryDefinition : elementQueryDefinitions.queries.fetchAll;
  const isObjectSearch = !queryDefinition;

  async function getSearchResults() {
    watch(
      [baseQueryParameters, search],
      async () => {
        if (!search.value.length) return;
        if (isObjectSearch && !baseQueryParameters.value?.endpoint) return;
        const parameters = ref({
          ...baseQueryParameters.value,
          ...getSearchQueryParameters(search.value)
        });

        try {
          isLoading.value = true;
          data.value = await useQuerySync(_queryDefinition, {
            ...parameters.value
          });
        } catch (err) {
          if (config.public.debug) console.error(err);
        } finally {
          isLoading.value = false;
        }
      },
      { deep: true }
    );
  }

  getSearchResults();

  return {
    data,
    isLoading
  };
}

const defaultSearchKeys: SearchKey[] = ['abbreviation', 'displayName', 'name'];

export function getSearchQueryParameters(
  search: VeoSearch[],
  allowedKeys: SearchKey[] = defaultSearchKeys
): VeoSearchQueryParameters {
  if (!search.length) return {};
  return Object.fromEntries(
    search
      .filter((item) => allowedKeys.includes(item.searchFilter as SearchKey))
      .map((item) => [item.searchFilter, item.term])
  );
}

export function useUrlFilters(filters: VeoSearchFilters, search: Ref<VeoSearch[]>) {
  const route = useRoute();
  const urlFilters = computed<VeoSearch[]>(() =>
    filters.all
      .map((filter) => {
        if (!route.query[filter]) return null;
        return {
          searchFilter: filter,
          operator: '=',
          term: route.query[filter] as string
        };
      })
      .filter(Boolean)
  );

  watch(urlFilters, () => (search.value = urlFilters.value), { immediate: true });
}
