import { useQuery, useQueryClient, useMutation } from 'vue-query-v5';
import { read, mutate } from '~/requests/crud';

export function useFetchDomainUpdate() {
  return useQuery({
    queryKey: ['domainUpdates'],
    refetchOnMount: true,
    queryFn: async () => {
      const rawData = await read({ path: '/domains/updates' });
      return rawData;
    }
  });
}

export function useDomainUpdate(domainId: Ref<string>, templateId: Ref<string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!domainId.value || !templateId.value) {
        throw new Error('Domain ID and target version are required for migration');
      }

      const templatePath = computed(() => `/domains/${domainId.value}/update?template=${templateId.value}`);

      return mutate({
        path: templatePath.value,
        options: { method: 'POST' }
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domainUpdates'] });
    }
  });
}
