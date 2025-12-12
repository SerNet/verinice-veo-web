import { useMutation } from 'vue-query-v5';
import { read, mutate as _mutate } from '~/requests/crud';
import { getIsPending } from '~/composables/helpers';

export function useCatalogItems(unitId: Ref<string>, domainId: Ref<string>, itemIds = ref([])) {
  const query = useMutation({
    mutationFn: async () => {
      const path = `/units/${unitId.value}/domains/${domainId.value}/incarnation-descriptions?itemIds=${itemIds.value?.join()}`;
      const incarnationDescriptions = await read({ path });

      if (!incarnationDescriptions.parameters?.length) return [];

      return _mutate({
        path: `/units/${unitId.value}/incarnations`,
        options: {
          method: 'POST',
          body: incarnationDescriptions
        }
      });
    }
  });
  return {
    ...query,
    isPending: computed(() => getIsPending(query.status.value))
  };
}
