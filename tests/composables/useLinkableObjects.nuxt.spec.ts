/*
 * verinice.veo web
 * Copyright (C) 2026 Djordje Mirosavljevic
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License
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
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import type { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

const { useFetchObjectsMock, useFetchParentObjectsMock, useQueryMock, useSearchMock } = vi.hoisted(() => ({
  useFetchObjectsMock: vi.fn(),
  useFetchParentObjectsMock: vi.fn(),
  useQueryMock: vi.fn(),
  useSearchMock: vi.fn()
}));

vi.mock('~/composables/api/objects', () => ({
  useFetchObjects: useFetchObjectsMock,
  useFetchParentObjects: useFetchParentObjectsMock
}));

vi.mock('~/composables/api/utils/query', async (importOriginal) => ({
  ...(await importOriginal()),
  useQuery: useQueryMock
}));

vi.mock('~/composables/search/useSearch', () => ({
  useSearch: useSearchMock
}));

mockNuxtImport('useRoute', () => () => ({ params: {} }));

const { useLinkableObjects } = await import('~/composables/requests/useLinkableObjects');

const rawObjects = ref<IVeoPaginatedResponse<IVeoEntity[]>>();

function person(id: string, username?: string) {
  return { id, type: 'person', username } as IVeoEntity;
}

function useTestSubject(itemFilter?: (item: IVeoEntity) => boolean) {
  return useLinkableObjects({
    domainId: ref('domain-id'),
    unitId: ref('unit-id'),
    filter: ref({ objectType: 'person' }),
    search: ref([]),
    page: ref(3),
    sortBy: ref([{ key: 'name', order: 'asc' }]),
    pageSize: ref(25),
    editParents: ref(false),
    preselectedItems: ref([]),
    showCreateView: ref(false),
    itemFilter
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  rawObjects.value = {
    items: [person('free-person'), person('assigned-person', 'another-user')],
    page: 3,
    pageCount: 5,
    totalItemCount: 42
  };

  useFetchObjectsMock.mockReturnValue({ data: rawObjects, isFetching: ref(false) });
  useFetchParentObjectsMock.mockReturnValue({ data: ref(undefined), isFetching: ref(false) });
  useQueryMock.mockReturnValue({ data: ref(undefined), isFetching: ref(false) });
  useSearchMock.mockReturnValue({ data: ref(undefined), isLoading: ref(false) });
});

describe('useLinkableObjects()', () => {
  it('loads and filters all candidates when an item predicate is provided', () => {
    const { selectableObjects } = useTestSubject((item) => !item.username);
    const queryParameters = useFetchObjectsMock.mock.calls[0]?.[0];

    expect(queryParameters.value).toMatchObject({ page: 0, size: 9999 });
    expect(Array.isArray(selectableObjects.value)).toBe(true);
    expect(selectableObjects.value).toEqual([{ ...person('free-person'), disabled: false }]);
  });

  it('keeps normal pagination and the paginated response without an item predicate', () => {
    const { objects, selectableObjects } = useTestSubject();
    const queryParameters = useFetchObjectsMock.mock.calls[0]?.[0];

    expect(queryParameters.value).toMatchObject({ page: 3, size: 25 });
    expect(objects.value).toBe(rawObjects.value);
    expect(Array.isArray(selectableObjects.value)).toBe(false);
    expect(selectableObjects.value).toMatchObject({ page: 3, pageCount: 5, totalItemCount: 42 });
  });
});
