/*
 * verinice.veo web
 * Copyright (C) 2026 Djordje Mirosavljevic
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  refetchDefaultAssigneesMock,
  updatePersonMock,
  useDefaultTaskAssigneesMock,
  useFetchTasksMock,
  useManualTaskFilterMock,
  useMutationMock,
  useQueryMock,
  useQuerySyncMock,
  useRequirementImplementationQueryMock,
  useVeoUserMock
} = vi.hoisted(() => ({
  refetchDefaultAssigneesMock: vi.fn(),
  updatePersonMock: vi.fn(),
  useDefaultTaskAssigneesMock: vi.fn(),
  useFetchTasksMock: vi.fn(),
  useManualTaskFilterMock: vi.fn(),
  useMutationMock: vi.fn(),
  useQueryMock: vi.fn(),
  useQuerySyncMock: vi.fn(),
  useRequirementImplementationQueryMock: vi.fn(),
  useVeoUserMock: vi.fn()
}));

mockNuxtImport('useRoute', () => () => ({
  params: { domain: 'domain-id', unit: 'unit-id' }
}));

mockNuxtImport('useI18n', () => () => {
  const messages: Record<string, string> = {
    linkMyPerson: 'Meine Person verknüpfen',
    personAssignmentHint:
      'Um Aufgaben in der Unit zu übernehmen, verknüpfen Sie ein Personenobjekt mit ihrem Benutzerkonto.',
    title: 'Aufgaben'
  };

  return {
    locale: ref('de'),
    t: (key: string) => messages[key] ?? key
  };
});

vi.mock('~/composables/tasks', () => ({
  TASKS_PAGE_SIZE: 10,
  useDefaultTaskAssignees: useDefaultTaskAssigneesMock,
  useFetchTasks: useFetchTasksMock,
  useManualTaskFilter: useManualTaskFilterMock
}));

vi.mock('~/composables/VeoUser', () => ({
  useVeoUser: useVeoUserMock
}));

vi.mock('~/composables/requirementImplementation', () => ({
  useRequirementImplementationQuery: useRequirementImplementationQueryMock
}));

vi.mock('~/composables/api/utils/mutation', () => ({
  useMutation: useMutationMock
}));

vi.mock('~/composables/api/utils/query', async (importOriginal) => ({
  ...(await importOriginal()),
  useQuery: useQueryMock,
  useQuerySync: useQuerySyncMock
}));

import TasksPage from '~/pages/[unit]/domains/[domain]/tasks/index.vue';
import type { ManualTaskFilter } from '~/composables/tasks';
import type { IVeoEntity } from '~/types/VeoTypes';

const AlertStub = defineComponent({
  name: 'BaseAlert',
  props: {
    buttons: {
      type: Array as () => Array<{ dataVeoTest?: string; onClick?: () => void; text: string }>,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  },
  template: `
    <section data-veo-test="alert">
      <span>{{ title }}</span>
      <button
        v-for="button in buttons"
        :key="button.text"
        :data-veo-test="button.dataVeoTest"
        @click="button.onClick"
      >
        {{ button.text }}
      </button>
    </section>
  `
});

const ObjectDialogStub = defineComponent({
  name: 'ObjectAddObjectDialog',
  props: {
    allowCreateAndOpen: Boolean,
    createObjectDefaults: Object,
    domainId: String,
    modelValue: Boolean,
    objectType: String,
    onLink: Function,
    requireUnitContentManagement: Boolean,
    selectableItemFilter: Function
  },
  emits: ['success', 'update:modelValue'],
  template: '<div data-veo-test="person-assignment-dialog" />'
});

const LayoutStub = defineComponent({
  template: '<div><slot /></div>'
});

const defaultAssigneeIds = ref<string[] | undefined>([]);
const defaultAssigneesError = ref(false);
const defaultAssigneesReady = ref(true);
const manualTaskFilter = ref<ManualTaskFilter>();
const ownPersonsData = ref({ items: [] as Array<{ id: string }> });
const allPersonsData = ref({ items: [] as Array<{ id: string; username?: string }> });
const profile = ref<{ username?: string }>({ username: 'petra' });

type HiddenHintState = {
  queryError?: boolean;
  ready?: boolean;
  username?: string;
};

const hiddenHintStates: Array<[string, HiddenHintState]> = [
  ['the assignment query is not ready', { ready: false }],
  ['the profile has no username', { username: undefined }],
  ['the assignment query failed', { queryError: true }]
];

beforeEach(() => {
  vi.clearAllMocks();

  defaultAssigneeIds.value = [];
  defaultAssigneesError.value = false;
  defaultAssigneesReady.value = true;
  manualTaskFilter.value = undefined;
  ownPersonsData.value = { items: [] };
  allPersonsData.value = { items: [] };
  profile.value = { username: 'petra' };

  refetchDefaultAssigneesMock.mockResolvedValue({ data: { items: [] } });
  useDefaultTaskAssigneesMock.mockReturnValue({
    assigneeIds: defaultAssigneeIds,
    data: ownPersonsData,
    isError: defaultAssigneesError,
    ready: defaultAssigneesReady,
    refetch: refetchDefaultAssigneesMock
  });
  useFetchTasksMock.mockReturnValue({
    data: ref({ items: [], pageCount: 1, totalItemCount: 0 }),
    isError: ref(false),
    isFetching: ref(false),
    isPlaceholderData: ref(false)
  });
  useManualTaskFilterMock.mockReturnValue(manualTaskFilter);
  useMutationMock.mockReturnValue({ mutateAsync: updatePersonMock });
  useQueryMock.mockReturnValue({
    data: allPersonsData,
    isError: ref(false),
    isFetching: ref(false)
  });
  useQuerySyncMock.mockResolvedValue({});
  useRequirementImplementationQueryMock.mockReturnValue({
    openItem: vi.fn(),
    requirementImplementation: ref(),
    showDialog: ref(false)
  });
  useVeoUserMock.mockReturnValue({ profile });
});

async function mountPage() {
  return mountSuspended(TasksPage, {
    global: {
      stubs: {
        BaseAlert: AlertStub,
        BaseContainer: LayoutStub,
        BasePage: LayoutStub,
        ComplianceEditor: true,
        ObjectAddObjectDialog: ObjectDialogStub,
        TaskAssigneeFilter: true,
        TaskList: true
      }
    }
  });
}

async function openPersonDialog() {
  const wrapper = await mountPage();
  await wrapper.get('[data-veo-test="link-my-person"]').trigger('click');
  await nextTick();

  return { dialog: wrapper.getComponent(ObjectDialogStub), wrapper };
}

describe('tasks page person assignment', () => {
  it('shows the hint and CTA when the user assignment is ready and no person belongs to the username', async () => {
    const wrapper = await mountPage();

    expect(wrapper.text()).toContain(
      'Um Aufgaben in der Unit zu übernehmen, verknüpfen Sie ein Personenobjekt mit ihrem Benutzerkonto.'
    );
    expect(wrapper.get('[data-veo-test="link-my-person"]').text()).toContain('Meine Person verknüpfen');
  });

  it('hides the hint when a person already belongs to the username', async () => {
    defaultAssigneeIds.value = ['person-existing'];

    const wrapper = await mountPage();

    expect(wrapper.find('[data-veo-test="link-my-person"]').exists()).toBe(false);
  });

  it('configures the person dialog for account assignment', async () => {
    allPersonsData.value = {
      items: [{ id: 'person-unassigned' }, { id: 'person-assigned', username: 'another-user' }]
    };
    const { dialog } = await openPersonDialog();
    const isSelectable = dialog.props('selectableItemFilter') as (person: IVeoEntity) => boolean;

    expect(dialog.props()).toMatchObject({
      allowCreateAndOpen: false,
      createObjectDefaults: { username: 'petra' },
      domainId: 'domain-id',
      objectType: 'person',
      requireUnitContentManagement: false
    });
    expect(isSelectable({ id: 'person-unassigned' } as IVeoEntity)).toBe(true);
    expect(isSelectable({ id: 'person-assigned' } as IVeoEntity)).toBe(false);
  });

  it('reloads a selected person and links the current username through the full object', async () => {
    const fullPerson = {
      id: 'person-existing',
      name: 'Petra Müllerin',
      type: 'person',
      username: undefined
    } as IVeoEntity;
    useQuerySyncMock.mockResolvedValue(fullPerson);
    const { dialog } = await openPersonDialog();
    const onLink = dialog.props('onLink') as (persons: IVeoEntity[]) => Promise<void>;

    await onLink([{ id: fullPerson.id, type: 'person' } as IVeoEntity]);

    expect(useQuerySyncMock).toHaveBeenCalledWith(
      expect.objectContaining({ primaryQueryKey: 'object' }),
      {
        domain: 'domain-id',
        endpoint: 'persons',
        id: 'person-existing'
      },
      expect.anything()
    );
    expect(updatePersonMock).toHaveBeenCalledWith({
      domain: 'domain-id',
      endpoint: 'persons',
      id: 'person-existing',
      object: { ...fullPerson, username: 'petra' }
    });
  });

  it('does not overwrite an assignment added after the dialog loaded', async () => {
    useQuerySyncMock.mockResolvedValue({
      id: 'person-existing',
      name: 'Petra Müllerin',
      type: 'person',
      username: 'another-user'
    });
    const { dialog } = await openPersonDialog();
    const onLink = dialog.props('onLink') as (persons: IVeoEntity[]) => Promise<void>;

    await expect(onLink([{ id: 'person-existing', type: 'person' } as IVeoEntity])).rejects.toThrow(
      'personAlreadyAssigned'
    );
    expect(updatePersonMock).not.toHaveBeenCalled();
  });

  it.each(hiddenHintStates)('hides the hint when %s', async (_description, state) => {
    defaultAssigneesReady.value = state.ready ?? true;
    defaultAssigneesError.value = state.queryError ?? false;
    profile.value = { username: state.username === undefined && 'username' in state ? undefined : 'petra' };

    const wrapper = await mountPage();

    expect(wrapper.find('[data-veo-test="link-my-person"]').exists()).toBe(false);
  });

  it('keeps the linked person in the shared manual filter until the refetch contains it', async () => {
    let finishRefetch: (result: { data: { items: Array<{ id: string }> } }) => void = () => undefined;
    refetchDefaultAssigneesMock.mockReturnValue(
      new Promise((resolve) => {
        finishRefetch = resolve;
      })
    );
    const { dialog, wrapper } = await openPersonDialog();

    dialog.vm.$emit('success', ['person-linked']);

    expect(manualTaskFilter.value).toEqual({
      assigneeIds: ['person-linked'],
      domainId: 'domain-id',
      unitId: 'unit-id'
    });

    finishRefetch({ data: { items: [] } });
    await flushPromises();

    expect(manualTaskFilter.value?.assigneeIds).toEqual(['person-linked']);
    expect(wrapper.find('[data-veo-test="link-my-person"]').exists()).toBe(false);
  });

  it('clears the shared manual filter after the refetch contains the linked person', async () => {
    let finishRefetch: (result: { data: { items: Array<{ id: string }> } }) => void = () => undefined;
    refetchDefaultAssigneesMock.mockReturnValue(
      new Promise((resolve) => {
        finishRefetch = resolve;
      })
    );
    const { dialog } = await openPersonDialog();

    dialog.vm.$emit('success', ['person-linked']);
    expect(manualTaskFilter.value?.assigneeIds).toEqual(['person-linked']);

    finishRefetch({ data: { items: [{ id: 'person-linked' }] } });
    await flushPromises();

    expect(manualTaskFilter.value).toBeUndefined();
  });
});
