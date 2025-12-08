import { useMutation, useQueryClient } from 'vue-query-v5';
import { mutate, type RequestOptions } from '~/requests/crud';

export function useDataMutation(
  path: Ref<string>,
  options: Ref<RequestOptions>,
  queryKeysToInvalidate: Array<string> = []
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mutate({ path: path.value, options: options.value }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeysToInvalidate
      });
    }
  });
}
