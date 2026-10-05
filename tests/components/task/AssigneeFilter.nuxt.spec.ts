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
import { DOMWrapper, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

mockNuxtImport('useI18n', () => {
  const messages: Record<string, string> = {
    label: 'Nach zuständigen Personen filtern',
    nobody: 'Niemand',
    noResults: 'Keine passenden Personen gefunden',
    selection: 'Zuständig = {assignees}'
  };

  return () => ({
    t: (key: string, parameters: Record<string, string> = {}) =>
      Object.entries(parameters).reduce(
        (message, [name, value]) => message.replace(`{${name}}`, value),
        messages[key] ?? key
      )
  });
});

import AssigneeFilter, {
  getAssigneeLabel,
  UNASSIGNED_ASSIGNEE,
  type AssigneeFilterPerson
} from '~/components/task/AssigneeFilter.vue';

const persons: AssigneeFilterPerson[] = [
  { id: 'person-pm', abbreviation: 'PM', name: 'Petra Müllerin' },
  { id: 'person-al', abbreviation: 'AL', displayName: 'Abteilungsleiterin' },
  { id: 'person-vs', abbreviation: 'VS', displayName: 'VS Viola Seher' }
];

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

async function mountFilter(initialSelection: string[] = [], disabled = false) {
  const selection = ref(initialSelection);
  const Host = defineComponent({
    components: { AssigneeFilter },
    setup: () => ({ disabled, persons, selection }),
    template: '<AssigneeFilter v-model="selection" :persons="persons" :disabled="disabled" />'
  });

  wrapper = await mountSuspended(Host, { attachTo: document.body });
  return { selection, wrapper };
}

async function openMenu(currentWrapper: VueWrapper) {
  await currentWrapper.get('.v-field').trigger('mousedown');
  await currentWrapper.get('.v-field').trigger('click');
  await nextTick();

  return [...document.body.querySelectorAll<HTMLElement>('[data-veo-test="assignee-filter-item"]')];
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('AssigneeFilter', () => {
  it('builds concise labels from an abbreviation and the available person name', () => {
    expect(getAssigneeLabel(persons[0])).toBe('PM Petra Müllerin');
    expect(getAssigneeLabel(persons[1])).toBe('AL Abteilungsleiterin');
    expect(getAssigneeLabel(persons[2])).toBe('VS Viola Seher');
  });

  it('shows all selected people in one combined selection chip', async () => {
    const { wrapper } = await mountFilter(['person-pm', 'person-al']);

    const selections = wrapper.findAll('[data-veo-test="assignee-filter-selection"]');
    expect(selections).toHaveLength(1);
    expect(selections[0].text()).toBe('Zuständig = PM Petra Müllerin, AL Abteilungsleiterin');
  });

  it('offers the unassigned sentinel and updates the model when it is selected', async () => {
    const { selection, wrapper } = await mountFilter();
    const items = await openMenu(wrapper);
    const nobody = items.find((item) => item.textContent?.includes('Niemand'));

    expect(nobody).toBeDefined();
    await new DOMWrapper(nobody!.querySelector('[data-veo-test="assignee-filter-checkbox"]')!).trigger('click');

    expect(selection.value).toEqual([UNASSIGNED_ASSIGNEE]);
  });

  it('exposes checked state and labels for its selectable options', async () => {
    const { wrapper } = await mountFilter(['person-pm']);
    const items = await openMenu(wrapper);
    const petra = items.find((item) => item.textContent?.includes('Petra Müllerin'))!;
    const departmentLead = items.find((item) => item.textContent?.includes('Abteilungsleiterin'))!;

    expect(petra.getAttribute('role')).toBe('option');
    expect(petra.getAttribute('aria-selected')).toBe('true');
    expect(petra.querySelector('[data-veo-test="assignee-filter-checkbox"]')?.getAttribute('aria-hidden')).toBe('true');
    expect(departmentLead.getAttribute('aria-selected')).toBe('false');
  });

  it('filters the available people by their combined label', async () => {
    const { wrapper } = await mountFilter();
    await openMenu(wrapper);

    await wrapper.get('input').setValue('PM Petra');
    await nextTick();

    const visibleItems = [...document.body.querySelectorAll<HTMLElement>('[data-veo-test="assignee-filter-item"]')];
    expect(visibleItems.map((item) => item.textContent?.trim())).toEqual(['PM Petra Müllerin']);
  });

  it('clears the filter to the empty all-tasks selection', async () => {
    const { selection, wrapper } = await mountFilter(['person-pm', 'person-al']);

    await wrapper.get('[data-veo-test="assignee-filter-selection"] .v-chip__close').trigger('click');

    expect(selection.value).toEqual([]);
    expect(wrapper.find('[data-veo-test="assignee-filter-selection"]').exists()).toBe(false);
  });

  it('can be disabled while the default selection is loading', async () => {
    const { wrapper } = await mountFilter(['person-pm'], true);

    expect(wrapper.get('input[type="text"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.v-chip__close').exists()).toBe(false);
  });
});
