/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
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
import { omit } from 'lodash';

import { useFetchObjects, useFetchParentObjects } from '~/composables/api/objects';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuery } from '~/composables/api/utils/query';
import { useSearch } from '~/composables/search/useSearch';

import type { IVeoEntity, IVeoPaginatedResponse, IVeoControlImplementation } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import type { VeoSearch } from '~/types/VeoSearch';

interface UseLinkableObjectsOptions {
  domainId: Ref<string>;
  unitId: Ref<string>;
  filter: Ref<Record<string, any>>;
  search: Ref<VeoSearch[]>;
  page: Ref<number>;
  sortBy: Ref<{ key: string; order: string }[]>;
  pageSize: Ref<number>;

  parentObject?: Ref<IVeoEntity | undefined>;
  editParents: Ref<boolean>;
  preselectedItems: Ref<IVeoEntity[]>;

  showCreateView: Ref<boolean>;
  fetchControlImplementationTargets?: Ref<boolean>;
}

export function useLinkableObjects(options: UseLinkableObjectsOptions) {
  const {
    domainId,
    unitId,
    filter,
    search,
    page,
    sortBy,
    pageSize,
    parentObject,
    editParents,
    preselectedItems,
    showCreateView,
    fetchControlImplementationTargets
  } = options;

  const route = useRoute();
  const DEFAULT_PAGE_SIZE = 9999;
  const DEFAULT_PAGE = 0;

  const resolveEndpoint = (type?: string) => VeoElementTypePlurals[type ?? ''] ?? '';
  // Object list
  const objectListEndpoint = computed(() => resolveEndpoint(filter.value.objectType));

  const objectsQueryParams = computed<any>(() => ({
    size: pageSize.value,
    page: page.value,
    sortBy: sortBy.value[0]?.key,
    sortOrder: sortBy.value[0]?.order,
    unit: unitId.value,
    domain: domainId.value,
    endpoint: objectListEndpoint.value,
    ...omit(filter.value, 'objectType')
  }));

  const objectsQueryEnabled = computed(() => !!objectListEndpoint.value && !showCreateView.value);

  const { data: rawObjects, isFetching: objectsLoading } = useFetchObjects(objectsQueryParams, {
    enabled: objectsQueryEnabled,
    keepPreviousData: true
  });

  const { data: searchResults, isLoading: searchLoading } = useSearch({
    baseQueryParameters: objectsQueryParams,
    search
  });

  const objects = computed<IVeoPaginatedResponse<IVeoEntity[]>>(() =>
    search.value?.length ? searchResults.value : rawObjects.value
  );

  // Children
  const parentEndpoint = computed(() => resolveEndpoint(parentObject?.value?.type));

  const childrenQueryEnabled = computed(
    () => !!parentEndpoint.value && !!parentObject?.value?.id && !editParents.value
  );

  const baseChildrenParams = computed(() => ({
    domain: domainId.value,
    id: parentObject?.value?.id ?? '',
    size: DEFAULT_PAGE_SIZE
  }));

  const { data: childObjects, isFetching: childObjectsLoading } = useQuery(
    objectQueryDefinitions.queries.fetchObjectChildren,
    computed(() => ({ ...baseChildrenParams.value, endpoint: parentEndpoint.value })),
    { enabled: childrenQueryEnabled }
  );

  const { data: childScopes, isFetching: childScopesLoading } = useQuery(
    objectQueryDefinitions.queries.fetchScopeChildren,
    baseChildrenParams,
    {
      enabled: computed(() => childrenQueryEnabled.value && parentEndpoint.value === 'scopes')
    }
  );

  const children = computed<IVeoEntity[]>(() => {
    const uniqueChildren = new Map<string, IVeoEntity>();

    const allItems = [
      ...(childObjects.value?.items || []),
      ...(childScopes.value?.items || []),
      ...preselectedItems.value
    ];

    for (const item of allItems) {
      if (!uniqueChildren.has(item.id)) {
        uniqueChildren.set(item.id, item);
      }
    }

    return [...uniqueChildren.values()];
  });

  // Parents
  const parentsQueryEnabled = computed(
    () =>
      !!objectListEndpoint.value &&
      !!parentObject?.value?.id &&
      editParents.value &&
      !fetchControlImplementationTargets?.value
  );

  const { data: parents, isFetching: parentsLoading } = useFetchParentObjects(
    computed(() => ({
      size: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      unitId: unitId.value,
      parentEndpoint: objectListEndpoint.value,
      childObjectId: parentObject?.value?.id || ''
    })),
    { enabled: parentsQueryEnabled }
  );

  const controlImplementationTargetsQueryEnabled = computed(
    () => !!parentObject?.value?.id && !!domainId.value && !!fetchControlImplementationTargets?.value
  );

  const controlImplementationTargetsParams = computed(() => ({
    domain: domainId.value,
    endpoint: route.params.objectType as string,
    id: parentObject?.value?.id || '',
    purpose: 'COMPLIANCE' as const,
    size: DEFAULT_PAGE_SIZE,
    page: DEFAULT_PAGE
  }));

  const { data: controlImplementations, isFetching: controlImplementationsLoading } = useQuery(
    objectQueryDefinitions.queries.fetchObjectControlImplementations,
    controlImplementationTargetsParams,
    { enabled: controlImplementationTargetsQueryEnabled }
  );

  const controlImplementationTargets = computed<IVeoEntity[]>(() => {
    if (!controlImplementations.value?.items || !objectListEndpoint.value) return [];

    const targetType = filter.value.objectType;
    return controlImplementations.value.items
      .filter((ci: IVeoControlImplementation) => !targetType || ci.owner?.type === targetType)
      .map((ci: IVeoControlImplementation) => ({
        id: ci.owner.id,
        type: ci.owner.type,
        name: ci.owner.name,
        displayName: ci.owner.displayName
      })) as IVeoEntity[];
  });

  // selectable logic
  const originalSelectedItems = computed<IVeoEntity[]>(() => {
    if (fetchControlImplementationTargets?.value) {
      return [...controlImplementationTargets.value, ...preselectedItems.value];
    }
    return editParents.value ? [...(parents.value?.items || []), ...preselectedItems.value] : children.value;
  });

  const originalIds = computed(() => new Set(originalSelectedItems.value.map((i) => i.id)));

  const selectableObjects = computed(() => {
    if (!objects.value?.items) {
      return objects.value;
    }

    const disabledIds = new Set([...originalIds.value, ...(parentObject?.value?.id ? [parentObject.value.id] : [])]);

    return {
      ...objects.value,
      items: objects.value.items.map((obj) => ({
        ...obj,
        disabled: disabledIds.has(obj.id)
      }))
    };
  });

  // Loading
  const isLoadingObjects = computed(
    () =>
      objectsLoading.value ||
      searchLoading.value ||
      childObjectsLoading.value ||
      childScopesLoading.value ||
      parentsLoading.value ||
      controlImplementationsLoading.value
  );

  return {
    objects,
    selectableObjects,
    originalSelectedItems,
    isLoadingObjects
  };
}
