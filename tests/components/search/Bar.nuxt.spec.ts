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
import { DOMWrapper, type VueWrapper } from '@vue/test-utils';
import { mdiAlphabeticalVariant, mdiTextBoxCheckOutline } from '@mdi/js';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import SearchBar from '~/components/search/Bar.vue';
import type { VeoSearch, VeoSearchFilters } from '~/types/VeoSearch';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    te: () => false
  });
});

const filters: VeoSearchFilters = {
  all: [
    { key: 'name', value: 'Name' },
    { key: 'status', value: 'Status', options: { NEW: 'New', RELEASED: 'Released' } }
  ],
  default: { key: 'name', value: 'Name' }
};

let wrapper: VueWrapper | undefined;

beforeAll(() => {
  Object.defineProperty(globalThis, 'visualViewport', {
    configurable: true,
    value: {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
      width: 1024
    }
  });
});

async function mountSearchBar(
  initialSearch: VeoSearch[],
  initialContextChips: VeoSearch[] = [],
  searchFilters: VeoSearchFilters = filters
) {
  const search = ref(initialSearch);
  const contextChips = ref(initialContextChips);
  const Host = defineComponent({
    components: { SearchBar },
    setup: () => ({
      contextChips,
      filters: searchFilters,
      removeContextChip: (chip: VeoSearch) => {
        contextChips.value = contextChips.value.filter((contextChip) => contextChip !== chip);
      },
      search
    }),
    template:
      '<SearchBar v-model:search="search" :context-chips="contextChips" :filters="filters" @remove-context-chip="removeContextChip" />'
  });

  wrapper = await mountSuspended(Host, { attachTo: document.body });
  return { contextChips, search, wrapper };
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('SearchBar', () => {
  it('closes the search on Enter when every criterion is complete', async () => {
    const { wrapper } = await mountSearchBar([{ searchFilter: 'name', operator: '=', term: 'policy' }]);
    const input = wrapper.get('input');
    await wrapper.get('.v-field').trigger('mousedown');
    await wrapper.get('.v-field').trigger('click');
    expect(input.attributes('aria-expanded')).toBe('true');

    await input.trigger('keydown', { key: 'Enter' });

    expect(input.attributes('aria-expanded')).toBe('false');
  });

  it('keeps the search open on Enter while a criterion is incomplete', async () => {
    const { wrapper } = await mountSearchBar([{ searchFilter: 'status', operator: '=' }]);
    const input = wrapper.get('input');
    await wrapper.get('.v-field').trigger('mousedown');
    await wrapper.get('.v-field').trigger('click');
    expect(input.attributes('aria-expanded')).toBe('true');

    await input.trigger('keydown', { key: 'Enter' });

    expect(input.attributes('aria-expanded')).toBe('true');
  });

  it('clears the complete search with the trailing reset action', async () => {
    const { contextChips, search, wrapper } = await mountSearchBar(
      [
        { searchFilter: 'name', operator: '=', term: 'policy' },
        { searchFilter: 'status', operator: '=', term: 'NEW' }
      ],
      [{ term: 'Context' }]
    );

    await wrapper.get('[data-veo-test="search-reset"]').trigger('click');

    expect(search.value).toEqual([]);
    expect(contextChips.value).toEqual([]);
  });

  it('removes only the selected criterion from a multi-filter search', async () => {
    const { search, wrapper } = await mountSearchBar([
      { searchFilter: 'name', operator: '=', term: 'policy' },
      { searchFilter: 'status', operator: '=', term: 'NEW' }
    ]);
    const groups = wrapper.findAll('[data-veo-test="search-active"]');

    await groups[1].get('.v-chip__close').trigger('click');

    expect(search.value).toEqual([{ searchFilter: 'name', operator: '=', term: 'policy' }]);
  });

  it('selects a filter by clicking a dropdown row', async () => {
    const { search, wrapper } = await mountSearchBar([]);

    await wrapper.get('.v-field').trigger('mousedown');
    await wrapper.get('.v-field').trigger('click');
    await nextTick();
    const firstItem = document.body.querySelector<HTMLElement>('[data-veo-test="searchbar-item"]');
    expect(firstItem).not.toBeNull();

    await new DOMWrapper(firstItem!).trigger('click');

    expect(search.value[0]).toMatchObject({ searchFilter: 'name', operator: '=' });
  });

  it('shows semantic icons for the available search filters', async () => {
    const { wrapper } = await mountSearchBar([]);

    await wrapper.get('.v-field').trigger('mousedown');
    await wrapper.get('.v-field').trigger('click');
    await nextTick();
    const items = [...document.body.querySelectorAll<HTMLElement>('[data-veo-test="searchbar-item"]')];

    expect(items.map((item) => item.querySelector('path')?.getAttribute('d'))).toEqual([
      mdiAlphabeticalVariant,
      mdiTextBoxCheckOutline
    ]);
  });

  it('reuses the existing object type icons for object type values', async () => {
    const objectTypeFilters: VeoSearchFilters = {
      all: [
        {
          key: 'objectType',
          value: 'Object type',
          options: { process: 'Process', person: 'Person' }
        }
      ],
      default: { key: 'objectType', value: 'Object type' }
    };
    const { wrapper } = await mountSearchBar([{ searchFilter: 'objectType', operator: '=' }], [], objectTypeFilters);

    await wrapper.get('.v-field').trigger('mousedown');
    await wrapper.get('.v-field').trigger('click');
    await nextTick();
    const items = [...document.body.querySelectorAll<HTMLElement>('[data-veo-test="searchbar-item"]')];

    expect(items.map((item) => item.querySelector('path')?.getAttribute('d'))).toEqual([
      OBJECT_TYPE_ICONS.get('process')?.icon,
      OBJECT_TYPE_ICONS.get('person')?.icon
    ]);
  });
});
