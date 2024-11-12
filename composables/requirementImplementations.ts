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
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useCompliance } from '~/components/compliance/compliance';
import elementQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import { useQuery } from '~/composables/api/utils/query';
import type { RequirementImplementation } from '~/types/VeoTypes';
import { CustomAspect } from './api/queryDefinitions/catalogs';

interface QueryParameters {
  domain: string;
  endpoint: string;
  id: string;
  requirementId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  size: number;
  page: number;
  customAspects?: string[];
}

/**
 * Maps a sorting key used in the frontend to the actual sorting key that is accepted by the backend.
 * Some sorting keys are prefixed with 'translations.', which is stripped by this function.
 * @param key the sorting key that is used in the frontend
 * @returns the sorting key that is used in the backend
 */
function mapSortingKey(key: string): string {
  const keyMap: Record<string, string> = {
    'translations.origination': 'origination',
    'translations.status': 'status'
  };
  return keyMap[key] ?? key;
}

/**
 * Fetches a list of requirement implementations for a given control module.
 *
 * This composable returns a reactive object with the following properties:
 * - `sortBy`: the sorting key that is currently used for the list
 * - `page`: the current page number
 * - `translatedRequirementImplementations`: the list of requirement implementations, where each item has a `translations` property with translated values for `status` and `origination`
 * - `isLoadingRequirementImplementations`: a boolean indicating whether the list is currently being fetched from the API
 * - `refetch`: a function that can be used to refetch the list from the API
 *
 * The sorting key and page number can be changed by assigning new values to `sortBy` and `page`. The composable will automatically fetch the new list from the API.
 *
 * The list is fetched from the API when the composable is initialized, and whenever the `sortBy` or `page` values change.
 *
 * The composable uses the `useRoute` composable to get the current route, and the `useCompliance` composable to get the current compliance type and the current control module.
 * It also uses the `useVeoUser` composable to get the user's preferred table page size.
 *
 * @returns a reactive object with the properties `sortBy`, `page`, `translatedRequirementImplementations`, `isLoadingRequirementImplementations`, and `refetch`
 */
export function useRequirementImplementationList() {
  const { t: globalT } = useI18n();
  const { tablePageSize } = useVeoUser();
  const route = useRoute();
  const { state } = useCompliance();

  const sortBy = ref([{ key: 'control.abbreviation', order: 'asc' }]);
  const page = ref(0);

  const requirementImplementationsQueryParameters = computed<QueryParameters>(() => ({
    domain: route.params.domain as string,
    endpoint: state.type.value as string,
    id: state.CTLModule.value.owner.id as string,
    requirementId: state.CTLModule.value.id,
    sortBy: mapSortingKey(sortBy.value[0].key),
    sortOrder: sortBy.value[0].order as 'asc' | 'desc',
    size: tablePageSize.value,
    page: page.value,
    customAspects: [CustomAspect.ControlBpInformation]
  }));

  const isQueryEnabled = computed(() =>
    Boolean(state.CTLModule.value && state.type.value !== 'all' && route.params.domain)
  );

  const {
    data: requirementImplementations,
    isLoading: isLoadingRequirementImplementations,
    refetch
  } = useQuery(
    elementQueryDefinitions.queries.fetchObjectRequirementImplementations,
    requirementImplementationsQueryParameters,
    {
      keepPreviousData: true,
      enabled: isQueryEnabled.value
    }
  );

  watch(requirementImplementationsQueryParameters, async () => {
    if (!requirementImplementationsQueryParameters.value) return;
    // Refetch data
    await refetch();
  });

  const translatedRequirementImplementations = computed(() => translateData(requirementImplementations.value));

  /**
   * Translates the status and origination properties of each item in the given data.
   * @param data the data to translate
   * @returns the translated data
   */
  function translateData(data: { items: RequirementImplementation[] } | null) {
    if (!data?.items || data.items.length === 0) return null;

    return {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        translations: {
          status: globalT(`compliance.status.${item.status}`),
          origination: globalT(`compliance.origination.${item.origination}`)
        }
      }))
    };
  }

  return {
    sortBy,
    page,
    translatedRequirementImplementations,
    isLoadingRequirementImplementations,
    refetch
  };
}
