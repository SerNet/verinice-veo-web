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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const { profile, useQueryMock } = vi.hoisted(() => ({
  profile: { value: { username: 'petra' } as Record<string, unknown> },
  useQueryMock: vi.fn()
}));

vi.mock('~/composables/VeoUser', () => ({
  useVeoUser: () => ({ profile })
}));

vi.mock('~/composables/api/utils/query', async (importOriginal) => ({
  ...(await importOriginal()),
  useQuery: useQueryMock
}));

vi.mock('~/utils/featureFlags', () => ({
  hasFeature: () => true
}));

const { useDefaultTaskAssignees, useDefaultTaskCount, useFetchTasks } = await import('~/composables/tasks');

function mockQueries(personIds: string[] = ['person-2', 'person-1'], taskCount = 4) {
  useQueryMock.mockImplementation((definition) =>
    definition.primaryQueryKey === 'personsInDomain' ?
      {
        data: { value: { items: personIds.map((id) => ({ id })) } },
        isError: { value: false }
      }
    : {
        data: { value: { items: [], totalItemCount: taskCount } },
        isError: { value: false },
        isPlaceholderData: { value: false }
      }
  );
}

beforeEach(() => {
  useQueryMock.mockReset();
  profile.value = { username: 'petra' };
  mockQueries();
});

describe('task composables', () => {
  it('finds every person assigned to the current username', () => {
    const scope = ref({ domainId: 'domain-id', unitId: 'unit-id' });

    const { assigneeIds, ready } = useDefaultTaskAssignees(scope);

    expect(useQueryMock.mock.calls[0]?.[1].value).toEqual({
      domainId: 'domain-id',
      unitId: 'unit-id',
      username: 'petra'
    });
    expect(useQueryMock.mock.calls[0]?.[2].enabled.value).toBe(true);
    expect(ready.value).toBe(true);
    expect(assigneeIds.value).toEqual(['person-2', 'person-1']);
  });

  it('counts tasks with the readonly default assignee filter', () => {
    const count = useDefaultTaskCount(ref({ domainId: 'domain-id', unitId: 'unit-id' }));
    const taskQueryParameters = useQueryMock.mock.calls[1]?.[1];

    expect(taskQueryParameters.value).toEqual({
      domainId: 'domain-id',
      unit: 'unit-id',
      assigneeIds: ['person-1', 'person-2'],
      includeUnassigned: undefined,
      page: 0,
      size: 1
    });
    expect(useQueryMock.mock.calls[1]?.[2].enabled.value).toBe(true);
    expect(count.value).toBe(4);
  });

  it('counts all tasks when no person belongs to the current username', () => {
    mockQueries([]);

    useDefaultTaskCount(ref({ domainId: 'domain-id', unitId: 'unit-id' }));

    expect(useQueryMock.mock.calls[1]?.[1].value.assigneeIds).toBeUndefined();
    expect(useQueryMock.mock.calls[1]?.[2].enabled.value).toBe(true);
  });

  it('does not fetch an unfiltered count while the default assignees are unresolved', () => {
    useQueryMock.mockReturnValue({
      data: { value: undefined },
      isError: { value: false },
      isPlaceholderData: { value: false }
    });

    const count = useDefaultTaskCount(ref({ domainId: 'domain-id', unitId: 'unit-id' }));

    expect(useQueryMock.mock.calls[1]?.[2].enabled.value).toBe(false);
    expect(count.value).toBe(0);
  });

  it('hides a previous count while the next default filter is loading', () => {
    useQueryMock
      .mockReturnValueOnce({
        data: { value: undefined },
        isError: { value: false },
        isPlaceholderData: { value: false }
      })
      .mockReturnValueOnce({
        data: { value: { items: [], totalItemCount: 23 } },
        isError: { value: false },
        isPlaceholderData: { value: true }
      });

    const count = useDefaultTaskCount(ref({ domainId: 'new-domain', unitId: 'new-unit' }));

    expect(useQueryMock.mock.calls[1]?.[2].enabled.value).toBe(false);
    expect(count.value).toBe(0);
  });

  it('treats a loaded profile without a username as an empty default filter', () => {
    profile.value = {};
    useQueryMock.mockReturnValueOnce({
      data: { value: undefined },
      isError: { value: false },
      isPlaceholderData: { value: false }
    });

    const { assigneeIds, ready } = useDefaultTaskAssignees(ref({ domainId: 'domain-id', unitId: 'unit-id' }));

    expect(useQueryMock.mock.calls[0]?.[2].enabled.value).toBe(false);
    expect(ready.value).toBe(true);
    expect(assigneeIds.value).toEqual([]);
  });

  it('keeps a manual page filter separate from the default count filter', () => {
    const pageFilter = ref({
      domainId: 'domain-id',
      unitId: 'unit-id',
      assigneeIds: ['other-person'],
      includeUnassigned: true
    });

    useFetchTasks(pageFilter);
    useDefaultTaskCount(ref({ domainId: 'domain-id', unitId: 'unit-id' }));

    expect(useQueryMock.mock.calls[0]?.[1].value.assigneeIds).toEqual(['other-person']);
    expect(useQueryMock.mock.calls[2]?.[1].value.assigneeIds).toEqual(['person-1', 'person-2']);
  });

  it('preserves an empty assignee list when only unassigned tasks are selected', () => {
    useFetchTasks(
      ref({
        domainId: 'domain-id',
        unitId: 'unit-id',
        assigneeIds: [],
        includeUnassigned: true
      })
    );

    expect(useQueryMock.mock.calls[0]?.[1].value).toMatchObject({
      assigneeIds: [],
      includeUnassigned: true
    });
  });
});
