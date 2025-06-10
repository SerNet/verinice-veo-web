import { useQuerySync } from '~/composables/api/utils/query';
import { useRequest } from '~/composables/api/utils/request';
import { handleErrorMessage } from '~/composables/utils';
import { useQueryClient } from '@tanstack/vue-query';

import type { TVeoError } from '../utils';

export type TVeoAction = {
  id: string;
  name: { de: string; en: string };
  affectedRessources?: string[];
};

type TVeoPerformActionParams = { actionId?: string; affectedRessources?: string[] };

function useUrl() {
  const url = ref();
  const route = useRoute();

  const requestParams = computed(() => ({
    domainId: route.params.domain as string,
    elementType: route.params.objectType as string,
    elementId: route.params.object as string
  }));

  const isEnabled = computed(
    () => requestParams.value.domainId && requestParams.value.elementType && requestParams.value.elementId
  );

  url.value =
    isEnabled ?
      `/api/domains/${requestParams.value.domainId}/${requestParams.value.elementType}/${requestParams.value.elementId}/actions`
    : '';

  return { url, isEnabled };
}
export function useActions() {
  const data = ref([]);
  const error = ref<TVeoError>(null);
  const isLoading = ref(true);

  const { request } = useRequest();

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

  const { url, isEnabled } = useUrl();
  watch(isEnabled, () => (isEnabled.value ? fetchActions(url.value) : []), { immediate: true });

  return {
    data,
    isLoading,
    error
  };
}

export function usePerformActions() {
  const queryClient = useQueryClient();
  const isLoading = ref(false);
  const error = ref<TVeoError>(null);

  function performVeoAction({ actionId, affectedRessources }: TVeoPerformActionParams) {
    const { url: baseUrl, isEnabled } = useUrl();

    watch(
      isEnabled,
      async () => {
        if (!isEnabled.value) return;

        const url = `/${baseUrl.value}/${actionId}/execution`;

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
          updateAffectedResources(affectedRessources);
        } catch (err) {
          error.value = handleErrorMessage(err);
        } finally {
          isLoading.value = false;
        }
      },
      { immediate: true }
    );
  }

  function updateAffectedResources(queryKey: string[]) {
    queryClient.invalidateQueries({ queryKey });
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
