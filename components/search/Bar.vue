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
    v-model:menu="menuOpen"
    data-component-name="veo-search"
    hide-details="auto"
    :placeholder="t('search')"
    :items="selectionItems"
    :item-title="(item) => translateItem(item)"
    :append-inner-icon="mdiMagnify"
    chips
    hide-selected
    variant="outlined"
    :density="density"
    auto-select-first="exact"
    :aria-label="t('search')"
    class="veo-search"
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
        <v-chip v-if="s.term" size="large" class="mr-2" label variant="flat">{{ translateTerm(s) }}</v-chip>
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
import type { VeoSearch, VeoSearchFilter, VeoSearchFilters, VeoSearchOperators } from '~/types/VeoSearch';

type VeoSearchFilterOption = {
  optionValue: string;
  optionLabel: string;
};

type VeoSearchSelectionItem = VeoSearchFilter | VeoSearchFilterOption | string;

type UpdateSearchMsg = {
  type: string;
  oldSearch?: VeoSearch[];
  newValue?: string;
};

const props = withDefaults(
  defineProps<{
    filters?: VeoSearchFilters;
    operators?: VeoSearchOperators;
    density?: 'default' | 'comfortable' | 'compact';
    initialSearch?: VeoSearch[];
  }>(),
  {
    filters: () => ({
      all: [
        { key: 'abbreviation', value: 'abbreviation' },
        { key: 'name', value: 'name' },
        { key: 'displayName', value: 'displayName' }
      ],
      default: { key: 'displayName', value: 'displayName' }
    }),
    operators: () => ({
      all: ['='],
      default: '='
    }),
    density: 'default',
    initialSearch: () => []
  }
);

const { t, te } = useI18n();
const { t: globalT, te: globalTe } = useI18n({ useScope: 'global' });
const filters = computed<VeoSearchFilter[]>(() => [...props.filters.all]);
const operators = computed(() => [...props.operators.all]);
const hasSingleOperator = computed(() => operators.value.length === 1);

function getSelectedFilterKeys(search: VeoSearch[]) {
  return new Set(search.map((item) => item.searchFilter).filter((filter): filter is string => !!filter));
}

function normalizeSearch(search: VeoSearch[]) {
  return search.filter((item) => item.searchFilter || item.operator || item.term);
}

function getSearchFilter(key?: string) {
  return filters.value.find((filter) => filter.key === key);
}

function getSearchFilterOptions(filterKey?: string): VeoSearchFilterOption[] {
  const options = getSearchFilter(filterKey)?.options;
  if (!options) return [];

  return Object.entries(options).map(([optionValue, optionLabel]) => ({
    optionValue,
    optionLabel
  }));
}

function isSearchFilterOption(item: unknown): item is VeoSearchFilterOption {
  return typeof item === 'object' && item !== null && 'optionValue' in item;
}

function updateSearch(msg: UpdateSearchMsg): VeoSearch[] {
  const search = cloneDeep(msg.oldSearch ?? []);
  const searchPart: Partial<VeoSearch> = search.pop() ?? {};

  switch (msg.type) {
    case 'updateFilter':
      if (searchPart.term) {
        return normalizeSearch([
          ...search,
          searchPart,
          {
            searchFilter: msg.newValue,
            operator: hasSingleOperator.value ? props.operators.default : undefined
          }
        ]);
      }
      return normalizeSearch([
        ...search,
        {
          ...searchPart,
          searchFilter: msg.newValue,
          operator: hasSingleOperator.value ? props.operators.default : searchPart.operator
        }
      ]);
    case 'updateOperator':
      return normalizeSearch([...search, { ...searchPart, operator: msg.newValue }]);
    case 'updateTerm':
      return normalizeSearch([
        ...search,
        {
          ...searchPart,
          searchFilter: searchPart.searchFilter ?? props.filters.default.key,
          operator: searchPart.operator ?? props.operators.default,
          term: msg.newValue
        }
      ]);
    case 'addToTerm':
      return normalizeSearch([...search, { ...searchPart, term: (searchPart.term ?? '') + msg.newValue }]);
    case 'reset':
      return [];
    default:
      return [];
  }
}

function translateItem(item: VeoSearchSelectionItem) {
  if (isSearchFilterOption(item)) {
    return item.optionLabel;
  }
  if (typeof item === 'object') {
    const i18nKey = `searchFilter_${item.key}`;
    const objectListI18nKey = `objectlist.${item.key}`;
    if (te(i18nKey)) return t(i18nKey);
    if (globalTe(objectListI18nKey)) return globalT(objectListI18nKey);
    return item.value;
  }
  const filterByKey = getSearchFilter(item);
  if (filterByKey) {
    const i18nKey = `searchFilter_${filterByKey.key}`;
    const objectListI18nKey = `objectlist.${filterByKey.key}`;
    if (te(i18nKey)) return t(i18nKey);
    if (globalTe(objectListI18nKey)) return globalT(objectListI18nKey);
    return filterByKey.value;
  }
  return item;
}

function translateTerm(searchPart: VeoSearch) {
  if (!searchPart.term) return '';
  return getSearchFilter(searchPart.searchFilter)?.options?.[searchPart.term] ?? searchPart.term;
}

// STATE
// Make search accessible in parent components using a v-model
const search = defineModel<VeoSearch[]>('search', {
  default: []
});

// Initialize search from props
if (props.initialSearch?.length) {
  search.value = props.initialSearch;
}
// v-combobox menu items
const selectionItems = computed(() => {
  const lastSearchPart: Partial<VeoSearch> = search.value.at(-1) ?? {};
  const availableFilters = filters.value.filter((filter) => !getSelectedFilterKeys(search.value).has(filter.key));
  if (lastSearchPart?.term) return availableFilters;
  if (lastSearchPart?.operator) return getSearchFilterOptions(lastSearchPart.searchFilter);
  if (lastSearchPart?.searchFilter)
    return hasSingleOperator.value ? getSearchFilterOptions(lastSearchPart.searchFilter) : operators.value;
  return availableFilters;
});

const searchInput = ref<HTMLInputElement>();
const menuOpen = ref(false);

function runSearch() {
  searchInput.value?.blur();
}

function resetSearch() {
  search.value = updateSearch({
    type: 'reset'
  });
}

function openMenuOnNextTick() {
  nextTick(() => (menuOpen.value = true));
}

// Current value of v-combobox
const select = ref();

watch(select, () => {
  if (!select.value) return;

  const newValue = cloneDeep(select.value);
  const oldSearch = cloneDeep(search.value);
  select.value = undefined;

  if (isSearchFilterOption(newValue)) {
    search.value = updateSearch({
      type: 'updateTerm',
      oldSearch,
      newValue: newValue.optionValue
    });
    openMenuOnNextTick();
    return;
  }

  if (typeof newValue === 'object' && 'key' in newValue) {
    const newSearchFilter = (newValue as VeoSearchFilter).key;
    if (getSelectedFilterKeys(oldSearch).has(newSearchFilter)) return;

    search.value = updateSearch({
      type: 'updateFilter',
      oldSearch,
      newValue: newSearchFilter
    });

    if (getSearchFilterOptions(newSearchFilter).length) {
      openMenuOnNextTick();
    }
    return;
  }

  // User selected an operator
  if (operators.value.includes(newValue)) {
    return (search.value = updateSearch({
      type: 'updateOperator',
      oldSearch,
      newValue
    }));
  }

  const lastSearchPart = oldSearch.at(-1);
  const optionValues = getSearchFilterOptions(lastSearchPart?.searchFilter).map((option) => option.optionValue);
  if (lastSearchPart?.operator && optionValues.length && !optionValues.includes(newValue)) return;

  const type = oldSearch.at(-1)?.term ? 'addToTerm' : 'updateTerm';
  search.value = updateSearch({ type, oldSearch, newValue });
  openMenuOnNextTick();
});

watch(selectionItems, (items) => {
  const lastSearchPart = search.value.at(-1);
  if (((lastSearchPart?.operator && !lastSearchPart.term) || lastSearchPart?.term) && items.length) {
    menuOpen.value = true;
  }
});

function handleDelete(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  if (target.value.length > 0) return;

  const oldSearch = cloneDeep(search.value);
  const searchPart = oldSearch.pop();
  if (!searchPart) return;

  if (searchPart.term) {
    search.value = normalizeSearch([...oldSearch, { ...searchPart, term: undefined }]);
    openMenuOnNextTick();
    return;
  }

  if (searchPart.operator) {
    search.value =
      hasSingleOperator.value ?
        normalizeSearch(oldSearch)
      : normalizeSearch([...oldSearch, { ...searchPart, operator: undefined }]);
    openMenuOnNextTick();
    return;
  }

  search.value = normalizeSearch(oldSearch);
  openMenuOnNextTick();
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
.veo-search {
  :deep(.v-field) {
    background: #fff;
  }

  :deep(.v-theme--dark.v-field) {
    background: unset;
  }
}
</style>
