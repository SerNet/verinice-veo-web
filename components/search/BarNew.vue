<!--
   - verinice.veo web
   - Copyright (C) 2025 Gerrit Krüger
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
    @keydown.arrow-right="(e: KeyboardEvent) => handleArrowRight(e)"
    @keydown.arrow-left="(e: KeyboardEvent) => handleArrowLeft(e)"
  >
    <template #prepend-inner>
      <div v-for="(s, index) in search" :key="checkForText(s.searchFilter)" class="d-flex">
        <template v-if="index !== search.length - 1">
          <v-chip size="small" color="#0F0F0F" class="mr-1" label>
            <v-chip v-if="s.searchFilter" size="small" color="red" class="mr-1" label>
              <v-icon v-if="s.searchFilter" size="small" class="mr-1" :icon="mdiFilter" start></v-icon>
              {{ translateItem(checkForText(s.searchFilter)) }}
            </v-chip>
            <v-chip v-if="s.operator" size="large" class="mr-1" color="green" label>{{ s.operator }}</v-chip>
            <v-chip v-if="s.term" size="large" class="mr-2" variant="flat" label>{{
              translateItem(checkForText(s.displayedText ?? s.term))
            }}</v-chip>
          </v-chip>
          <v-chip size="large" class="mr-2" label variant="flat" color="#1D1DD1">{{ translateItem('and') }}</v-chip>
        </template>

        <template v-else>
          <div class="d-flex">
            <v-chip v-if="s.searchFilter" size="small" color="red" class="mr-1">
              <v-icon v-if="s.searchFilter" size="small" class="mr-1" :icon="mdiFilter" start></v-icon>
              {{ translateItem(checkForText(s.searchFilter)) }}
            </v-chip>
            <v-chip v-if="s.operator" size="large" class="mr-1" color="green">{{ s.operator }}</v-chip>
            <v-chip v-if="s.term" size="large" class="mr-2" label variant="flat">{{
              translateItem(checkForText(s.displayedText ?? s.term))
            }}</v-chip>
          </div>
        </template>
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
import { useTranslations } from '~/composables/Translations';
import type { VeoSearch, VeoSearchFilters, VeoSearchOperators, VeoSearchFilterItem } from '~/types/VeoSearch';

type UpdateSearchMsg = {
  type: string;
  oldSearch?: VeoSearch[];
  newValue?: string | VeoSearchFilterItem;
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
      all: ['name', 'description', 'abbreviation'],
      default: 'name'
    }),
    operators: () => ({
      all: ['='],
      default: '='
    }),
    density: 'default'
  }
);

const { t, locale } = useI18n();

// ensure that all searchFilter and searchFilterItems ojects have a text parameter to display
function ensureTextProperties(obj) {
  const updatedObj = structuredClone(obj);

  function processObject(currentObj) {
    for (const key in currentObj) {
      const value = currentObj[key];

      if (typeof value === 'object' && value !== null) {
        if ('selection' in value && typeof value.selection === 'object') {
          for (const selKey in value.selection) {
            if (!('text' in value.selection[selKey])) {
              value.selection[selKey].text = selKey;
            }
          }
        }
        if (!('text' in value)) {
          value.text = key;
        }
      }
    }
  }

  processObject(updatedObj);
  return updatedObj;
}

function convertToObject(input: any, defaultValue: any = {}): Record<string, VeoSearchFilterItem> {
  if (Array.isArray(input)) {
    return input.reduce((acc: Record<string, any>, key: string) => {
      acc[key] = defaultValue;
      return acc;
    }, {});
  }
  return ensureTextProperties(input);
}

const convertedFilterObject: any = computed(() => {
  return convertToObject(props.filters.all);
});

const filtersKeys = computed(() => {
  return Object.entries(convertedFilterObject.value ?? {}).map(([key, option]) => (option as any)?.text ?? key);
});

const operators = [...props.operators.all];

function checkForText(item: any) {
  if (typeof item?.text === 'string') return item.text;
  else if (typeof item === 'string') return item;
  return undefined;
}

function updateSearch(msg: UpdateSearchMsg): VeoSearch[] {
  const search = cloneDeep(msg.oldSearch ?? []);

  function allValuesDefined(obj: Record<string, any>): boolean {
    if (!obj) return false;
    return Object.values(obj).every((value) => value !== undefined);
  }

  const checkNewSearch = msg.type === 'updateFilter' && msg.newValue !== undefined && allValuesDefined(search?.at(-1));

  const searchPart: Partial<VeoSearch> = checkNewSearch ? {} : search.pop();

  const newValueText = checkForText(msg.newValue);

  switch (msg.type) {
    case 'updateFilter':
      return [...search, { ...searchPart, searchFilter: msg.newValue }];
    case 'updateOperator':
      return [...search, { ...searchPart, operator: typeof msg.newValue === 'string' ? msg.newValue : undefined }];
    case 'updateTerm':
      if (typeof searchPart?.searchFilter === 'object') {
        // In case searchFilter have searchFilterItems to select
        const isValidSelection = Object.entries(searchPart.searchFilter.selection)
          .map(([key, option]) => ({ key, option }))
          .find(({ option }) => option?.text === newValueText);
        return [
          ...search,
          {
            ...searchPart,
            searchFilter: searchPart?.searchFilter ?? props.filters.default,
            operator: searchPart?.operator ?? props.operators.default,
            term:
              isValidSelection ? searchPart?.searchFilter.selection[isValidSelection.key]?.value.toString() : undefined,
            displayedText:
              isValidSelection ? searchPart?.searchFilter?.selection[isValidSelection.key]?.text : undefined
          }
        ];
      } // In case searchFilter input is a text and not a searchFilterItem
      else
        return [
          ...search,
          {
            ...searchPart,
            searchFilter: searchPart?.searchFilter ?? props.filters.default,
            operator: searchPart?.operator ?? props.operators.default,
            term: newValueText,
            displayedText: newValueText
          }
        ];
    case 'addToTerm':
      if (typeof searchPart?.searchFilter === 'object') {
        const isValidSelection = Object.entries(searchPart.searchFilter.selection)
          .map(([key, option]) => ({ key, option }))
          .find(({ option }) => option?.text === newValueText);
        return [
          ...search,
          {
            ...searchPart,
            searchFilter: searchPart?.searchFilter?.text ?? props.filters.default,
            operator: searchPart?.operator ?? props.operators.default,
            term:
              isValidSelection ? searchPart?.searchFilter.selection[isValidSelection.key]?.value.toString() : undefined,
            displayedText: isValidSelection ? searchPart?.searchFilter.selection[isValidSelection.key]?.text : undefined
          }
        ];
      } else
        return [
          ...search,
          {
            ...searchPart,
            term: (searchPart.term ?? '') + msg.newValue,
            displayedText: (searchPart.term ?? '') + msg.newValue
          }
        ];
    case 'reset':
      return [];
    default:
      return [...search, { ...searchPart }];
  }
}

const route = useRoute();

const { data: translations } = useTranslations({ domain: route.params.domain as string });

function translateItem(item: string) {
  const tmp = t(`searchbar.${item}`);

  if (tmp.includes('searchbar.'))
    return translations.value?.lang[locale.value]?.[item] ?? tmp.replace('searchbar.', '');
  else return tmp.replace('searchbar.', '');
}

// STATE
// Make search accessible in parent components using a v-model
const search = defineModel<VeoSearch[]>('search', {
  default: []
});

// Get existing queries form url and assign them to search
// TODO: Make this the sole mechanism to set the search state, the abvove v-model will then become obsolete
if (hasFeature('urlParams')) useUrlFilters(ensureTextProperties(props.filters.all), search);

/**
if(hasFeature('urlParams')) watch(props.filters, () => {
  if(hasFeature('urlParams')) useUrlFilters(props.filters, search);
});
*/

// v-combobox menu items
const selectionItems = computed(() => {
  const lastSearchPart: Partial<VeoSearch> = search.value.at(-1) ?? {};
  if (lastSearchPart?.term) return filtersKeys.value;
  if (lastSearchPart?.operator) {
    return typeof lastSearchPart.searchFilter !== 'string' ?
        Object.entries(lastSearchPart.searchFilter.selection).map(([key, option]) => option?.text ?? key)
      : [];
  }
  if (lastSearchPart?.searchFilter) return operators;
  return filtersKeys.value;
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

watch([select, locale], () => {
  if (!select.value) return;

  const newValue: string = cloneDeep(select.value);
  const oldSearch = cloneDeep(search.value);
  select.value = undefined;

  // User selected a filter
  if (filtersKeys.value.includes(newValue)) {
    if (convertedFilterObject.value[newValue]?.selection) {
      // In case filter gets a selection
      return (search.value = updateSearch({
        type: 'updateFilter',
        oldSearch,
        newValue: convertedFilterObject.value[newValue]
      }));
    } // In case filter gets text
    else
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

function handleArrowRight(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  if (target.value.length > 0) return;

  if (!search?.value?.at(-1)?.displayedText) return;

  const arr = search.value ?? [];
  if (arr.length === 0) return [];
  return (search.value = [arr[arr.length - 1], ...arr.slice(0, -1)]);
}

function handleArrowLeft(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  if (target.value.length > 0) return;

  if (!search?.value?.at(-1)?.displayedText) return;

  const arr = search.value ?? [];
  if (arr.length === 0) return [];
  return (search.value = [...arr.slice(1), arr[0]]);
}

function handleDelete(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  if (target.value.length > 0) return;

  const oldSearch = cloneDeep(search.value);

  if (!oldSearch?.at(-1)) {
    return (search.value = updateSearch({ type: 'reset' }));
  }

  // Update search term
  if (oldSearch.at(-1)?.term) {
    return (search.value = updateSearch({
      type: 'updateTerm',
      oldSearch,
      newValue: search.value.at(-1)?.term?.slice(0, -1) || ''
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

  // Update search list and delete last objects thats empty to emulate 'And' operator gets deletet
  if (oldSearch.at(-1).searchFilter === undefined) {
    if (oldSearch.length > 1) {
      oldSearch.pop();
      return (search.value = updateSearch({
        type: '',
        oldSearch,
        newValue: undefined
      }));
    } else return (search.value = updateSearch({ type: 'reset' }));
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

  :deep(.v-chip-top-space) {
    margin-top: 6px !important;
    margin-bottom: 2px !important;
  }

  :deep(.v-field__placeholder) {
    opacity: 0.7;
    font-style: italic;
  }
}
</style>
