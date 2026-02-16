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
  <v-combobox
    ref="searchInput"
    v-model="select"
    data-component-name="veo-search"
    hide-details="auto"
    :placeholder="t('search')"
    :items="selectionItems"
    :item-title="(item) => translateItem(item)"
    :append-inner-icon="mdiMagnify"
    chips
    hide-selected
    :class="hasCompactTable ? 'compact-view' : ''"
    :density="density"
    auto-select-first="exact"
    :aria-label="t('search')"
    @click:clear="resetSearch"
    @click:append-inner="runSearch"
    @keydown.delete="(e: KeyboardEvent) => handleDelete(e)"
  >
    <template #prepend-inner>
      <div v-for="s in search" :key="s.searchFilter" class="d-flex">
        <v-chip v-if="s.searchFilter" size="small" color="red" class="mr-1">
          <v-icon v-if="s.searchFilter" size="small" class="mr-1" :icon="mdiFilter" start />
          {{ translateItem(s.searchFilter) }}
        </v-chip>
        <v-chip v-if="s.operator" size="large" class="mr-1" color="green">{{ s.operator }}</v-chip>
        <v-chip v-if="s.term" size="large" class="mr-2" label variant="flat">{{ s.term }}</v-chip>
      </div>
    </template>
    <template #append-inner>
      <v-icon class="mr-4" :icon="mdiCloseCircle" :aria-label="t('reset')" @click="resetSearch" />
    </template>
  </v-combobox>
</template>

<script setup lang="ts">
import { mdiCloseCircle, mdiFilter, mdiMagnify } from '@mdi/js';
import { cloneDeep } from 'lodash';
import { hasFeature } from '~/utils/featureFlags';
import type { VeoSearch, VeoSearchFilters, VeoSearchOperators } from '~/types/VeoSearch';

type UpdateSearchMsg = {
  type: string;
  oldSearch?: VeoSearch[];
  newValue?: string;
};

const { data: userSettings } = useSettings();
const hasCompactTable = computed(() => {
  return userSettings.value?.['compact-styles'] ?? false;
});
const props = withDefaults(
  defineProps<{
    filters?: VeoSearchFilters;
    operators?: VeoSearchOperators;
    density?: 'default' | 'comfortable' | 'compact';
  }>(),
  {
    filters: () => ({
      all: ['abbreviation', 'name', 'displayName'],
      default: 'displayName'
    }),
    operators: () => ({
      all: ['='],
      default: '='
    }),
    density: 'default'
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

// Get existing queries form url and assign them to search
// TODO: Make this the sole mechanism to set the search state, the abvove v-model will then become obsolete
if (hasFeature('urlParams')) useUrlFilters(props.filters, search);

// v-combobox menu items
const selectionItems = computed(() => {
  const lastSearchPart: Partial<VeoSearch> = search.value.at(-1) ?? {};
  if (lastSearchPart?.term) return filters;
  if (lastSearchPart?.operator) return [];
  if (lastSearchPart?.searchFilter) return operators;
  return filters;
});

const searchInput = ref<HTMLInputElement>();

function runSearch() {
  searchInput.value?.blur();
}

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

<i18n src="~/locales/base/components/search-bar.json"></i18n>

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
.compact-view {
  :deep(.v-field__field) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  :deep(.v-field__input) {
    min-height: 36px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  :deep(.v-field) {
    min-height: 36px !important;
  }

  :deep(.v-chip) {
    margin-top: 2px !important;
    margin-bottom: 2px !important;
  }

  :deep(.v-field__placeholder) {
    opacity: 0.7;
    font-style: italic;
  }
}
</style>
