import { useMutation } from '@tanstack/vue-query';
import { read, mutate as _mutate } from '~/requests/crud';

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
  return query;
}
