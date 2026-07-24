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
    :placeholder="hasSearchChips ? undefined : t('search')"
    :items="selectionItems"
    :item-title="(item) => translateItem(item)"
    :append-inner-icon="mdiMagnify"
    chips
    hide-selected
    variant="outlined"
    :density="density"
    auto-select-first="exact"
    :aria-label="t('search')"
    :class="['veo-search', { 'veo-search--has-chips': hasSearchChips, 'veo-search--has-input': hasSearchInput }]"
    @click:clear="resetSearch"
    @click:append-inner="runSearch"
    @keydown.delete="(e: KeyboardEvent) => handleDelete(e)"
  >
    <template #prepend-inner>
      <div
        ref="searchChipScroll"
        class="search-chip-scroll"
        @wheel.prevent="onSearchChipWheel"
        @pointerdown="onSearchChipPointerDown"
        @pointermove="onSearchChipPointerMove"
        @pointerup="onSearchChipPointerEnd"
        @pointercancel="onSearchChipPointerEnd"
        @pointerleave="onSearchChipPointerEnd"
      >
        <div v-for="chip in contextChips" :key="`context-${chip.searchFilter}`" class="d-flex flex-shrink-0">
          <v-chip v-if="chip.searchFilter" size="small" color="red" class="mr-1">
            <v-icon size="small" class="mr-1" :icon="mdiFilter" start />
            {{ chip.searchFilter }}
          </v-chip>
          <v-chip v-if="chip.operator" size="large" class="mr-1" color="green">{{ chip.operator }}</v-chip>
          <v-chip v-if="chip.term" size="large" class="mr-2" label variant="flat">{{ chip.term }}</v-chip>
        </div>
        <div v-for="s in search" :key="s.searchFilter" class="d-flex flex-shrink-0">
          <v-chip v-if="s.searchFilter" size="small" color="red" class="mr-1">
            <v-icon v-if="s.searchFilter" size="small" class="mr-1" :icon="mdiFilter" start />
            {{ translateItem(s.searchFilter) }}
          </v-chip>
          <v-chip v-if="s.operator" size="large" class="mr-1" color="green">{{ s.operator }}</v-chip>
          <v-chip v-if="s.term" size="large" class="mr-2" label variant="flat">{{ translateTerm(s) }}</v-chip>
        </div>
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
    contextChips?: VeoSearch[];
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
    initialSearch: () => [],
    contextChips: () => []
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

function getSearchFilter(key?: string) {
  return filters.value.find((filter) => filter.key === key);
}

function normalizeSearch(search: VeoSearch[]) {
  return search.filter((item) => {
    if (!item.searchFilter && !item.operator && !item.term) return false;
    if (item.searchFilter && !getSearchFilter(item.searchFilter)) return false;
    if (item.operator && !item.searchFilter) return false;
    if (item.term && !item.searchFilter) return false;

    return true;
  });
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
  const existingSearchEntries = cloneDeep(msg.oldSearch ?? []);
  const currentSearchEntry: Partial<VeoSearch> = existingSearchEntries.pop() ?? {};
  const hasCompletedSearchEntry = !!currentSearchEntry.term;

  switch (msg.type) {
    case 'updateFilter':
      if (hasCompletedSearchEntry) {
        return normalizeSearch([
          ...existingSearchEntries,
          currentSearchEntry,
          {
            searchFilter: msg.newValue,
            operator: hasSingleOperator.value ? props.operators.default : undefined
          }
        ]);
      }
      return normalizeSearch([
        ...existingSearchEntries,
        {
          ...currentSearchEntry,
          searchFilter: msg.newValue,
          operator: hasSingleOperator.value ? props.operators.default : currentSearchEntry.operator
        }
      ]);
    case 'updateOperator':
      return normalizeSearch([...existingSearchEntries, { ...currentSearchEntry, operator: msg.newValue }]);
    case 'updateTerm':
      return normalizeSearch([
        ...existingSearchEntries,
        {
          ...currentSearchEntry,
          searchFilter: currentSearchEntry.searchFilter ?? props.filters.default.key,
          operator: currentSearchEntry.operator ?? props.operators.default,
          term: msg.newValue
        }
      ]);
    case 'addToTerm':
      return normalizeSearch([
        ...existingSearchEntries,
        { ...currentSearchEntry, term: (currentSearchEntry.term ?? '') + msg.newValue }
      ]);
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
// Current value of v-combobox
const select = ref();
const hasSearchChips = computed(() => !!props.contextChips.length || !!search.value.length);
const hasSearchInput = computed(() => !!select.value);

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
const searchChipScroll = ref<HTMLElement>();
const menuOpen = ref(false);
const chipScrollDrag = reactive({
  pointerId: undefined as number | undefined,
  startScrollLeft: 0,
  startX: 0
});
let searchChipResizeObserver: ResizeObserver | undefined;

function updateSearchChipScrollWidth() {
  const scrollElement = searchChipScroll.value;
  const fieldElement = scrollElement?.closest('.v-field');
  if (!(scrollElement instanceof HTMLElement) || !(fieldElement instanceof HTMLElement)) return;

  const appendInnerWidth = Math.max(
    fieldElement.querySelector<HTMLElement>('.v-field__append-inner')?.offsetWidth ?? 0,
    80
  );
  const fieldInputMinWidth = hasSearchChips.value && !hasSearchInput.value ? 0 : 160;
  const availableWidth = fieldElement.clientWidth - appendInnerWidth - fieldInputMinWidth;
  scrollElement.style.setProperty('--search-chip-scroll-width', `${Math.max(0, availableWidth)}px`);
}

onMounted(() => {
  nextTick(updateSearchChipScrollWidth);

  const fieldElement = searchChipScroll.value?.closest('.v-field');
  if (!(fieldElement instanceof HTMLElement)) return;

  searchChipResizeObserver = new ResizeObserver(updateSearchChipScrollWidth);
  searchChipResizeObserver.observe(fieldElement);
});

onBeforeUnmount(() => {
  searchChipResizeObserver?.disconnect();
});

watch([search, () => props.contextChips, select], () => nextTick(updateSearchChipScrollWidth), { deep: true });

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

function onSearchChipWheel(event: WheelEvent) {
  const target = searchChipScroll.value;
  if (!target) return;

  target.scrollLeft += event.deltaX || event.deltaY;
}

function onSearchChipPointerDown(event: PointerEvent) {
  const target = searchChipScroll.value;
  if (!target || event.button !== 0) return;

  chipScrollDrag.pointerId = event.pointerId;
  chipScrollDrag.startScrollLeft = target.scrollLeft;
  chipScrollDrag.startX = event.clientX;
  target.setPointerCapture(event.pointerId);
}

function onSearchChipPointerMove(event: PointerEvent) {
  const target = searchChipScroll.value;
  if (!target || chipScrollDrag.pointerId !== event.pointerId) return;

  target.scrollLeft = chipScrollDrag.startScrollLeft - (event.clientX - chipScrollDrag.startX);
}

function onSearchChipPointerEnd(event: PointerEvent) {
  const target = searchChipScroll.value;
  if (!target || chipScrollDrag.pointerId !== event.pointerId) return;

  chipScrollDrag.pointerId = undefined;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
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
  min-width: 0;

  :deep(.v-field) {
    background: #fff;
    min-width: 0;
  }

  :deep(.v-theme--dark.v-field) {
    background: unset;
  }

  :deep(.v-field__prepend-inner) {
    flex: 0 1 auto;
    min-width: 0;
    max-width: var(--search-chip-scroll-width, 100%);
    overflow: hidden;
  }

  :deep(.v-field__field) {
    flex: 1 1 160px;
    min-width: 96px;
  }

  :deep(.v-field__append-inner) {
    flex: 0 0 auto;
    min-width: 72px;
  }

  &.veo-search--has-chips:not(.veo-search--has-input) {
    :deep(.v-field__field) {
      flex: 0 0 0;
      min-width: 0;
    }
  }
}

.search-chip-scroll {
  display: flex;
  align-items: center;
  cursor: grab;
  min-width: 0;
  width: max-content;
  max-width: var(--search-chip-scroll-width, 100%);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }

  &:active {
    cursor: grabbing;
  }
}
</style>
