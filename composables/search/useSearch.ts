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
import type { VeoSearch, VeoSearchQueryParameters, VeoSearchFilters, VeoSearchFilterItem } from '~/types/VeoSearch';
import type { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

type UseSearchParams<T> = {
  baseQueryParameters: Ref<T & { endpoint?: string; page?: number }>;
  search: Ref<VeoSearch[]>;
  queryDefinition?: any;
};

type VeoSearchResponse = IVeoPaginatedResponse<IVeoEntity[]> | undefined;

// The 'subtype' search key is taken out for now because it conflicts with the navigation subtype.
type SearchKey =
  | 'abbreviation'
  | 'displayName'
  | 'name'
  | 'designator'
  | 'status'
  | 'description'
  | 'hasParentElements'
  | 'hasChildElements';

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

const defaultSearchKeys: SearchKey[] = [
  'name',
  'abbreviation',
  'displayName',
  'designator',
  'status',
  'description',
  'hasParentElements',
  'hasChildElements'
];

const defaultSearch = defaultSearchKeys.reduce(
  (acc, key) => {
    acc[key] = undefined;
    return acc;
  },
  {} as Record<SearchKey, undefined>
);

export function getSearchQueryParameters(
  search: VeoSearch[],
  allowedKeys: SearchKey[] = defaultSearchKeys
): VeoSearchQueryParameters {
  if (!search.length) return defaultSearch;
  return Object.fromEntries(
    search
      .filter((item) => allowedKeys.includes(getSearchFiltersKey(item.searchFilter) as SearchKey))
      .map((item) => [getSearchFiltersKey(item.searchFilter), item.term])
  );
}

export function useUrlFilters(filters: VeoSearchFilters, search: Ref<VeoSearch[]>) {
  const route = useRoute();

  const searchFilters = filters.all ?? filters;

  if (hasFeature('newSearchbar')) {
    // rebuild new searchbar from url if VEO_FEATURE_FLAG_NEW_SEARCHBAR and VEO_FEATURE_FLAG_URL_PARAMS are true
    const keys = new Set(Object.keys(searchFilters));

    const urlFilters = computed<VeoSearch[]>(() =>
      Object.keys(route.query)
        .filter((filter) => keys.has(filter) && route.query[filter])
        .map((filter) => {
          if (!route.query[filter]) return null;
          return {
            searchFilter: searchFilters[filter].selection ? searchFilters[filter] : filter,
            operator: '=',
            term: route.query[filter] as string,
            displayedText:
              searchFilters[filter]?.selection ?
                searchFilters[filter]?.selection[route.query[filter]]?.text
              : route.query[filter]
          };
        })
        .filter(Boolean)
    );

    watch(
      [urlFilters],
      () => {
        if (search.value.length === 0) search.value = urlFilters.value; // only load search from url if the search is empty
        if (search.value[search.value.length - 1]?.searchFilter === undefined) search.value = urlFilters.value;
      },
      { immediate: true }
    );
  } else {
    const urlFilters = computed<VeoSearch[]>(() => {
      if (!Array.isArray(searchFilters)) {
        return [];
      }
      return searchFilters
        .map((filter) => {
          if (!route.query[filter]) return null;
          return {
            searchFilter: filter,
            operator: '=',
            term: route.query[filter] as string
          };
        })
        .filter(Boolean);
    });

    watch(
      [urlFilters],
      () => {
        search.value = urlFilters.value;
      },
      { immediate: true }
    );
  }
}

function getSearchFiltersKey(filter: string | VeoSearchFilterItem): string | undefined {
  return typeof filter === 'string' ? filter : filter?.text;
}
