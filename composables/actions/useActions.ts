import { useQuerySync } from '~/composables/api/utils/query';
import { useRequest } from '~/composables/api/utils/request';
import { handleErrorMessage } from '~/composables/utils';

import type { TVeoError } from '../utils';

export type TVeoAction = {
  id: string;
  name: { de: string; en: string };
  affectedRessources?: string[];
};

type TVeoGetActionsParams = { domainId: string; elementType: string; elementId: string };
type TVeoPerformActionParams = TVeoGetActionsParams & { actionId?: string; affectedRessources?: string[] };

export function useActions({ domainId, elementType, elementId }: TVeoGetActionsParams) {
  const { request } = useRequest();
  const url = `/api/domains/${domainId}/${elementType}/${elementId}/actions`;

  const data = ref([]);
  const error = ref<TVeoError>(null);
  const isLoading = ref(true);

  async function fetchActions(url: string) {
    try {
      const response = await request(url, { method: 'GET' });
      data.value = addAffectedRessourceKeys(response);
    } catch (err: unknown) {
      error.value = handleErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  }

  fetchActions(url);

  return {
    data,
    isLoading,
    error
  };
}

export function usePerformActions() {
  const isLoading = ref(false);
  const error = ref<TVeoError>(null);

  async function performVeoAction({ domainId, elementType, elementId, actionId }: TVeoPerformActionParams) {
    const url = `/api/domains/${domainId}/${elementType}/${elementId}/actions/${actionId}/execution`;

    const requestParams = {
      method: 'POST',
      url,
      primaryQueryKey: '',
      mutationParameterTransformationFn: () => ({}),
      queryParameterTransformationFn: () => ({})
    };

    try {
      isLoading.value = true;
      await useQuerySync(requestParams);
    } catch (err) {
      error.value = handleErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    performVeoAction,
    isLoading,
    error
  };
}

/* @description returns an array of query keys of resources which are affected by an action */
function getAffectedRessources(actionId: string) {
  switch (actionId) {
    case 'threatOverview':
      return ['risks'];
    default:
      return [];
  }
}

function addAffectedRessourceKeys(veoActions: TVeoAction[]) {
  return veoActions.map((action) => ({
    ...action,
    affectedRessources: getAffectedRessources(action.id)
  }));
}
