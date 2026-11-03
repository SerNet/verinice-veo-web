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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick } from 'vue';

import AddObjectDialog from '~/components/object/AddObjectDialog.vue';
import { defineViewport } from '~/tests/components/helpers';

const ObjectTableStub = defineComponent({
  name: 'ObjectTable',
  props: {
    enableLinks: Boolean,
    showSelect: Boolean,
    singleSelect: Boolean
  },
  template: '<div />'
});

const { createObjectMock, queryClient, useQuerySyncMock } = vi.hoisted(() => ({
  createObjectMock: vi.fn(),
  queryClient: { invalidateQueries: vi.fn() },
  useQuerySyncMock: vi.fn()
}));

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal()),
  useQueryClient: () => queryClient
}));

vi.mock('~/composables/api/utils/mutation', () => ({
  useMutation: () => ({ mutateAsync: createObjectMock })
}));

vi.mock('~/composables/api/utils/query', async (importOriginal) => {
  const { ref } = await import('vue');
  return {
    ...(await importOriginal()),
    useQuery: () => ({
      data: ref({
        elementTypeDefinitions: {
          person: {
            subTypes: { PER_Person: { sortKey: 1 } }
          }
        }
      })
    }),
    useQuerySync: useQuerySyncMock
  };
});

vi.mock('~/composables/requests/useLinkableObjects', async () => {
  const { ref } = await import('vue');
  return {
    useLinkableObjects: () => ({
      selectableObjects: ref({ items: [], page: 0, pageCount: 0, totalItemCount: 0 }),
      originalSelectedItems: ref([]),
      isLoadingObjects: ref(false)
    })
  };
});

vi.mock('~/composables/search/objectFilters', async () => {
  const { ref } = await import('vue');
  return { useObjectSearchFilters: () => ref({ all: [], default: { key: 'name', value: 'name' } }) };
});

vi.mock('~/composables/Translations', async () => {
  const { ref } = await import('vue');
  return {
    useTranslations: () => ({
      data: ref({
        lang: {
          de: {
            person: 'Person',
            person_plural: 'Personen',
            person_PER_Person_singular: 'Person'
          }
        }
      })
    })
  };
});

vi.mock('~/composables/useObjectTableNoDataText', () => ({
  useObjectTableNoDataText: () => ({ noDataText: () => '' })
}));

vi.mock('~/composables/VeoAlert', () => ({
  useVeoAlerts: () => ({ displayErrorMessage: vi.fn() })
}));

vi.mock('~/composables/VeoPermissions', async () => {
  const { ref } = await import('vue');
  return {
    useVeoPermissions: () => ({
      ability: ref({ can: () => true }),
      subject: (_type: string, value: unknown) => value
    })
  };
});

vi.mock('~/composables/VeoUser', async () => {
  const { ref } = await import('vue');
  return { useVeoUser: () => ({ tablePageSize: ref(20) }) };
});

mockNuxtImport('useRoute', () => {
  return () => ({ params: { domain: 'domain-1', unit: 'unit-1' } });
});

beforeAll(() => {
  defineViewport();
});

beforeEach(() => {
  createObjectMock.mockReset().mockResolvedValue({ resourceId: 'person-1' });
  useQuerySyncMock.mockReset().mockResolvedValue({ id: 'person-1', type: 'person' });
  queryClient.invalidateQueries.mockReset();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('AddObjectDialog assignment options', () => {
  it('uses radio selection without object links when only one object can be selected', async () => {
    const wrapper = await mountSuspended(AddObjectDialog, {
      props: {
        modelValue: true,
        domainId: 'domain-1',
        objectType: 'person'
      },
      global: {
        stubs: {
          ObjectFilterBar: true,
          ObjectTable: ObjectTableStub,
          SearchBar: true
        }
      }
    });

    expect(wrapper.getComponent({ name: 'ObjectTable' }).props()).toMatchObject({
      enableLinks: false,
      showSelect: true,
      singleSelect: true
    });
  });

  it('keeps checkbox selection when multiple objects can be selected', async () => {
    const wrapper = await mountSuspended(AddObjectDialog, {
      props: {
        modelValue: true,
        domainId: 'domain-1',
        objectType: 'person',
        multiSelect: true
      },
      global: {
        stubs: {
          ObjectFilterBar: true,
          ObjectTable: ObjectTableStub,
          SearchBar: true
        }
      }
    });

    expect(wrapper.getComponent({ name: 'ObjectTable' }).props()).toMatchObject({
      enableLinks: false,
      showSelect: true,
      singleSelect: false
    });
  });

  it('adds create object defaults to the create payload', async () => {
    const wrapper = await mountSuspended(AddObjectDialog, {
      attachTo: document.body,
      props: {
        modelValue: true,
        domainId: 'domain-1',
        objectType: 'person',
        initialTab: 'create',
        allowCreateAndOpen: false,
        createObjectDefaults: { username: 'petra' }
      }
    });

    const nameField = wrapper
      .findAllComponents({ name: 'VTextField' })
      .find((field) => field.props('label') === 'name');
    expect(nameField).toBeDefined();
    nameField?.vm.$emit('update:modelValue', 'Petra Müllerin');

    const subTypeField = wrapper
      .findAllComponents({ name: 'VSelect' })
      .find((field) => field.props('label') === 'subType');
    expect(subTypeField).toBeDefined();
    subTypeField?.vm.$emit('update:modelValue', 'PER_Person');

    const form = wrapper.getComponent({ name: 'VForm' });
    form.vm.$emit('update:modelValue', true);
    await nextTick();

    const createButton = [...document.body.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'createObjectButton'
    );
    expect(createButton).toBeDefined();
    createButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.waitFor(() => expect(createObjectMock).toHaveBeenCalledOnce());

    expect(createObjectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'persons',
        object: expect.objectContaining({
          username: 'petra',
          type: 'person',
          name: 'Petra Müllerin',
          abbreviation: undefined,
          subType: 'PER_Person',
          status: 'NEW'
        }),
        parentScopes: []
      })
    );
  });

  it('hides the create-and-open action when it is disabled', async () => {
    await mountSuspended(AddObjectDialog, {
      attachTo: document.body,
      props: {
        modelValue: true,
        domainId: 'domain-1',
        objectType: 'person',
        initialTab: 'create',
        allowCreateAndOpen: false
      }
    });

    const labels = [...document.body.querySelectorAll('button')].map((button) => button.textContent?.trim());

    expect(labels).toContain('createObjectButton');
    expect(labels).not.toContain('createAndOpen');
  });
});
