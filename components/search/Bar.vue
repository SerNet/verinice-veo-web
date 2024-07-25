<!--
   - verinice.veo web
   - Copyright (C) 2024 jae
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <label>{{ t('search') }}</label>

  <v-combobox
    v-model="select"
    :items="selectionItems"
    :item-title="(item) => translateItem(item)"
    :append-inner-icon="mdiCloseCircle"
    :append-icon="mdiMagnify"
    chips
    hide-selected
    auto-select-first="exact"
    @click:clear="search = []"
    @click:append-inner="resetSearch"
    @keydown.delete="(e: KeyboardEvent) => handleDelete(e)"
  >
    <template #prepend-inner>
      <div v-for="s in search" :key="s.searchFilter" class="d-flex">
        <v-chip v-if="s.searchFilter" size="small" class="mr-1">
          <template #prepend>
            <v-avatar class="bg-primary text-uppercase" start>{{ translateItem(s.searchFilter).slice(0, 1) }}</v-avatar>
          </template>
          {{ translateItem(s.searchFilter) }}
        </v-chip>
        <v-chip v-if="s.operator" size="large" class="mr-1" variant="flat" color="green">{{ s.operator }}</v-chip>
        <v-chip v-if="s.term" size="large" class="mr-2" label variant="flat">{{ s.term }}</v-chip>
      </div>
    </template>
  </v-combobox>
</template>

<script setup lang="ts">
import { mdiCloseCircle, mdiMagnify } from '@mdi/js';
import { cloneDeep } from 'lodash';
import type { VeoSearch, VeoSearchFilters, VeoSearchOperators } from '~/types/VeoSearch';

type UpdateSearchMsg = {
  type: string;
  oldSearch?: VeoSearch[];
  newValue?: string;
};

const props = withDefaults(
  defineProps<{
    filters?: VeoSearchFilters;
    operators?: VeoSearchOperators;
  }>(),
  {
    filters: () => ({
      all: ['abbreviation', 'name', 'displayName'],
      default: 'displayName'
    }),
    operators: () => ({
      all: ['='],
      default: '='
    })
  }
);

const { t } = useI18n();
const filters = [...props.filters.all];
const operators = [...props.operators.all];

function updateSearch(msg: UpdateSearchMsg): VeoSearch[] {
  const search = cloneDeep(msg.oldSearch ?? []);
  const searchPart: Partial<VeoSearch> = search.pop() ?? {};

  switch (msg.type) {
    case 'updateFilter':
      return [...search, { ...searchPart, searchFilter: msg.newValue }];
    case 'updateOperator':
      return [...search, { ...searchPart, operator: msg.newValue }];
    case 'updateTerm':
      return [
        ...search,
        {
          ...searchPart,
          searchFilter: searchPart.searchFilter ?? props.filters.default,
          operator: searchPart.operator ?? props.operators.default,
          term: msg.newValue
        }
      ];
    case 'addToTerm':
      return [...search, { ...searchPart, term: (searchPart.term ?? '') + msg.newValue }];
    case 'reset':
      return [];
    default:
      return [];
  }
}

function translateItem(item: string) {
  if (filters.includes(item)) return t(`searchFilter_${item}`);
  return item;
}

// STATE
// Make search accessible in parent components using a v-model
const search = defineModel<VeoSearch[]>('search', {
  default: []
});

// v-combobox menu items
const selectionItems = computed(() => {
  const lastSearchPart: Partial<VeoSearch> = search.value.at(-1) ?? {};
  if (lastSearchPart?.term) return filters;
  if (lastSearchPart?.operator) return [];
  if (lastSearchPart?.searchFilter) return operators;
  return filters;
});

function resetSearch() {
  search.value = updateSearch({
    type: 'reset'
  });
}

// Current value of v-combobox
const select = ref();

watch(select, () => {
  if (!select.value) return;

  const newValue = cloneDeep(select.value);
  const oldSearch = cloneDeep(search.value);
  select.value = undefined;

  // User selected a filter
  if (filters.includes(newValue)) {
    return (search.value = updateSearch({
      type: 'updateFilter',
      oldSearch,
      newValue
    }));
  }

  // User selected an operator
  if (operators.includes(newValue)) {
    return (search.value = updateSearch({
      type: 'updateOperator',
      oldSearch,
      newValue
    }));
  }

  const type = oldSearch.at(-1)?.term ? 'addToTerm' : 'updateTerm';
  search.value = updateSearch({ type, oldSearch, newValue });
});

function handleDelete(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  if (target.value.length > 0) return;

  const oldSearch = cloneDeep(search.value);
  if (!oldSearch.at(-1)) return;

  // Update search term
  if (oldSearch.at(-1)?.term) {
    return (search.value = updateSearch({
      type: 'updateTerm',
      oldSearch,
      newValue: search.value.at(-1)?.term?.slice(0, -1)
    }));
  }

  // Update search operator
  if (oldSearch.at(-1)?.operator) {
    return (search.value = updateSearch({
      type: 'updateOperator',
      oldSearch,
      newValue: undefined
    }));
  }

  // Update search filter
  return (search.value = updateSearch({
    type: 'updateFilter',
    oldSearch,
    newValue: undefined
  }));
}
</script>

<i18n>
{
"en": {
  "search": "Search",
  "searchFilter_name": 'name',
  "searchFilter_abbreviation": 'abbreviation',
  "searchFilter_displayName": 'name & abbreviation',
},
"de": {
  "search": "Suche",
  "searchFilter_name": 'Name',
  "searchFilter_abbreviation": 'Abkürzung',
  "searchFilter_displayName": 'Name & Abkürzung',
}
}
</i18n>

<style scoped lang="scss">
:deep(.v-combobox__menu-icon) {
  display: none;
}

:deep(.v-input__append) {
  cursor: pointer;
  :hover {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
