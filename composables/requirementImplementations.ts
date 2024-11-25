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
import elementQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import { useQuery } from '~/composables/api/utils/query';
import { VeoElementTypePlurals, type RequirementImplementation } from '~/types/VeoTypes';
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
 * Composable to fetch requirement implementations for a given target object.
 *
 * It expects the route to have the following parameters:
 * - `domain`: the ID of the domain
 * - `type`: the type of the target object (e.g. 'controls', 'measures', 'all')
 * - `targetObject`: the ID of the target object
 * - `control`: the ID of the control for which to fetch requirement implementations
 *
 * The composable returns an object with the following properties:
 * - `sortBy`: a reactive reference to the sorting key
 * - `page`: a reactive reference to the current page
 * - `translatedRequirementImplementations`: an object with the translated requirement implementations
 * - `isLoadingRequirementImplementations`: a boolean indicating whether the requirement implementations are currently being fetched
 * - `refetch`: a function to refetch the requirement implementations
 *
 * The `translatedRequirementImplementations` property is a reactive reference to an object with the following properties:
 * - `items`: an array of requirement implementations with translated status and origination properties
 */
export function useRequirementImplementationList() {
  const { t: globalT } = useI18n();
  const { tablePageSize } = useVeoUser();
  const route = useRoute();
  const { data: currentDomain } = useCurrentDomain();

  const sortBy = ref([{ key: 'control.abbreviation', order: 'asc' }]);
  const page = ref(0);

  const requirementImplementationsQueryParameters = computed<QueryParameters>(() => ({
    domain: route.params.domain as string,
    endpoint: VeoElementTypePlurals[route.query.type as keyof typeof VeoElementTypePlurals],
    id: route.query.targetObject as string,
    requirementId: route.query.control as string,
    sortBy: mapSortingKey(sortBy.value[0].key),
    sortOrder: sortBy.value[0].order as 'asc' | 'desc',
    size: tablePageSize.value,
    page: page.value,
    customAspects:
      currentDomain.value?.raw?.elementTypeDefinitions?.control?.customAspects?.control_bpInformation ?
        [CustomAspect.ControlBpInformation]
      : undefined
  }));

  const isQueryEnabled = computed(() =>
    Boolean(route.query.control && route.query.type !== 'all' && route.params.domain)
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
