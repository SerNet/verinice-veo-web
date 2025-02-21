import { LocationQuery } from 'vue-router';
import { isEqual } from 'lodash';

export interface QueryParams extends LocationQuery {
  size: string;
  page: string;
  sortBy: string;
  sortOrder: 'desc' | 'asc';
  unit: string;
  endpoint: string;
  domain: string;
  abbreviation: string;
  displayName: string;
  name: string;
}

export function useQueryParams(params?: Ref<QueryParams>) {
  const route = useRoute();
  const router = useRouter();
  const queryParams = computed(() => route.query as QueryParams);

  function setQueryParameters(newParams: QueryParams): void {
    router.push({
      path: route.path,
      query: { ...newParams }
    });
  }

  // Watch params if provided
  let unwatchParams: (() => void) | undefined;

  if (params.value) {
    unwatchParams = watch(
      params,
      () => {
        if (!params?.value) return;
        if (isEqual(route.query, params.value)) return;

        setQueryParameters(params.value);
      },
      { immediate: true, deep: true }
    );
  }

  onScopeDispose(() => unwatchParams?.());

  return {
    queryParams,
    setQueryParameters
  };
}
