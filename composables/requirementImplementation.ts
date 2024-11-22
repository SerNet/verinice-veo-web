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
import { computed, nextTick, ref, watch } from 'vue';
import elementQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import type { RequirementImplementation } from '~/types/VeoTypes';
import { useQuery } from './api/utils/query';

interface RequirementImplementationParams {
  endpoint: string;
  id: string;
  requirementId: string;
}

/**
 * Extracts the requirement implementation ID from a URL.
 *
 * @param url A URL that is expected to contain the string "requirement-implementations/".
 * @returns The requirement implementation ID if the string was found, undefined otherwise.
 */
function getRequirementImplementationId(url: string): string | undefined {
  return url.split('requirement-implementations/').pop();
}

/**
 * Fetches a requirement implementation from the API, given some parameters.
 *
 * The purpose of this composable is to be used in the context of the
 * compliance list and the requirement implementation editor.
 *
 * The composable returns 3 values: `showDialog`, `requirementImplementation`, and
 * `openItem`. The `showDialog` value is a boolean that can be used to control the
 * visibility of a dialog. The `requirementImplementation` value is the fetched
 * requirement implementation data. The `openItem` function can be used to fetch
 * a requirement implementation and show the dialog.
 *
 * The `openItem` function takes an object with the following properties as argument:
 * - `type`: The type of the requirement implementation (e.g. 'controls', 'measures').
 * - `riskAffected`: The ID of the risk affected by the requirement implementation.
 * - `item`: The item to fetch the requirement implementation for. The item is expected
 *           to contain the property `_self` with a URL that contains the
 *           requirement implementation ID.
 *
 * The `reset` function can be used to reset the state of the composable.
 *
 * @example
 * const { showDialog, requirementImplementation, openItem } =
 *   useRequirementImplementationQuery();
 *
 * openItem({
 *   type: 'controls',
 *   riskAffected: 'some-id',
 *   item: {
 *     _self: 'https://example.com/controls/123/requirement-implementations/456'
 *   }
 * });
 */
import { useMutation } from '~/composables/api/utils/mutation';

export function useRequirementImplementationQuery() {
  const showDialog = ref(false);
  const queryParams = ref<RequirementImplementationParams | null>(null);

  const requirementImplementation = computed(() => data.value || null);

  // Query with manual control
  const { data, refetch } = useQuery<RequirementImplementationParams, RequirementImplementation>(
    elementQueryDefinitions.queries.fetchObjectRequirementImplementation,
    queryParams,
    {
      enabled: false,
      keepPreviousData: false
    }
  );
  const { mutateAsync } = useMutation(elementQueryDefinitions.mutations.updateRequirementImplementation);

  // Open item function
  async function openItem({
    type,
    targetObject,
    item
  }: {
    type: string | null;
    targetObject: string | null;
    item: any;
  }) {
    if (!type || !targetObject) {
      console.error('Missing required parameters');
      return;
    }

    try {
      const { _self } = item;
      const requirementImplementationId = getRequirementImplementationId(_self);

      if (!requirementImplementationId) {
        console.error('Invalid requirement implementation ID');
        return;
      }

      // Update query parameters
      queryParams.value = {
        endpoint: type,
        id: targetObject,
        requirementId: requirementImplementationId
      };

      // Wait for next tick again to ensure parameters are properly updated
      await nextTick();

      // Fetch data
      const result = await refetch();

      if (result.data) {
        showDialog.value = true;
      } else {
        console.error('No data received from fetch');
        showDialog.value = false;
      }
    } catch (error) {
      console.error('Error fetching requirement implementation:', error);
      showDialog.value = false;
    }
  }

  function reset() {
    queryParams.value = null;
    showDialog.value = false;
  }

  // Watch for dialog close to reset state
  watch(showDialog, (newValue) => {
    if (!newValue) reset();
  });

  // Update item function
  async function updateItem({
    endpoint,
    id,
    requirementId,
    requirementImplementation
  }: {
    endpoint: string;
    id: string;
    requirementId: string;
    requirementImplementation: any;
  }) {
    try {
      // Call the mutation
      await mutateAsync({
        endpoint,
        id,
        requirementId,
        requirementImplementation
      });
    } catch (error) {
      console.error('Error updating requirement implementation:', error);
      throw error;
    }
  }

  return {
    showDialog,
    requirementImplementation,
    openItem,
    updateItem
  };
}
