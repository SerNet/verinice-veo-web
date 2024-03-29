<!--
   - verinice.veo web
   - Copyright (C) 2021 Markus Werner, Jonas Heitmann
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
  <BaseTable
    v-bind="mergeProps(props, attrs)"
    :additional-headers="mergedAdditionalHeaders"
    :default-headers="unmatchedDefaultHeaders"
    @update:model-value="emit('update:model-value', $event)"
    @update:items-per-page="emit('update:items-per-page', $event)"
    @update:page="emit('update:page', $event)"
    @update:sort-by="emit('update:sort-by', $event)"
    @click="emit('click', $event)"
  >
    <template
      v-for="(_, name) in slots"
      #[name]="slotData"
    >
      <slot
        :name="name"
        v-bind="slotData"
      />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
import { mergeProps } from 'vue';
import type { SortItem } from 'vuetify/labs/VDataTable/composables/sort.mjs';

import ObjectIcon from '~/components/object/Icon.vue';
import { useFormatters } from '~/composables/utils';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~~/composables/api/utils/query';
import { TableFormatter, TableHeader, TableRenderer } from '~/components/base/Table.vue';

const props = withDefaults(defineProps<{
  /**
   * Items can be IVeoPaginatedResponse or an array.
   * @type IVeoPaginatedResponse<any[]> | any[], however if we write this instead of any, vue complains if the prop is of type IVeoPaginatedResponse<any[]> because it isn't an array
   */
  items?: any;
  /**
   * Displays a loading indicator. Works regardless of PaginatedResponse or array
   */
  loading?: boolean;
  /**
   * Array containing all elements selected in the table. As the stringified value is used by vuetify, internally we only select by id
   */
  modelValue?: any[];
  /**
   * Reflects the current page displayed in the table. Can be used with paginated data and simple arrays.
   */
  page?: number;
  /**
   * Defines how the table should be sorted.
   * NOTE: Paginated data can only be sorted by one column, all entries besides [0] will be ignored.
   */
  sortBy?: SortItem[];
  /**
   * Array containing the keys of commonly shown headers so that they don't have to get redefined every time.
   */
  defaultHeaders?: string[];
  /**
   * Array containing additional table headers that should get shown besides the default headers.
   */
  additionalHeaders?: TableHeader[];
  /**
   * Force-show all columns, even if this makes the table scrollable on the x-axis.
   */
  showAllColumns?: boolean;
  /**
   * Needed as we can't check whether @click is set in the attrs as soon as it is defiend as an emit.
   */
  enableClick?: boolean;
}>(), {
  items: () => [],
  loading: false,
  modelValue: () => [],
  page: 1,
  sortBy: () => [{ key: 'name', order: 'desc' }],
  defaultHeaders: () => [],
  additionalHeaders: () => [],
  showAllColumns: false,
  enableClick: false
});

const emit = defineEmits<{
  (e: 'update:sort-by', newSorting: SortItem[]): void;
  (e: 'update:page', newPage: number): void;
  (e: 'update:items-per-page', newItemsPerPage: number): void;
  (e: 'click', event: any): void;
  (e: 'update:model-value', newValue: any[]): void;
}>();

const { t, locale } = useI18n();
const route = useRoute();
const { formatDateTime } = useFormatters();
const slots = useSlots();
const attrs = useAttrs();

const translationQueryParameters = computed(() => ({ languages: [locale.value] }));
const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, translationQueryParameters);

/**
 * Render folder or file icons
 */
const renderIcon: TableRenderer = ({ item }) =>
  h(ObjectIcon, {
    objectType: item.raw.type,
    isComposite: !!item.raw.parts?.length
  });

/**
 * Render date column using date formatter
 */
const renderDate: TableRenderer = ({ item }) => (item.raw.updatedAt ? formatDate(item.raw.updatedAt) : '');

/**
 * Render created at / updated at tooltip
 */
const renderUpdatedAtTooltip: TableRenderer = ({ item }) => {
  return h('table', [
    item.raw.createdAt
      ? [h('tr', [
        h('td', [t('createdAt').toString(), ': ']),
        h('td', [h('strong', formatDate(item.raw.createdAt) || '???'), ' ', t('by').toString(), ' ', h('strong', item.raw.createdBy)])
      ])]
      : [],
    item.raw.updatedAt
      ? [h('tr', [
        h('td', [t('updatedAt').toString(), ': ']),
        h('td', [h('strong', formatDate(item.raw.updatedAt) || '???'), ' ', t('by').toString(), ' ', h('strong', item.raw.updatedBy)])
      ])]
      : []
  ]);
};

/**
 * Format date via i18n
 */
const formatDate: TableFormatter = (v) => {
  try {
    return formatDateTime(new Date(v)).value;
  } catch (e) {
    return '';
  }
};

/**
 * Render translated status
 */
const renderStatus: TableRenderer = ({ item }) => {
  const _item = item.raw;
  if (!route.params.domain) return '';
  const domainDetails = _item.domains?.[route.params.domain as string];
  const key = `${_item.type}_${domainDetails?.subType}_status_${domainDetails?.status}`;
  return translations.value?.lang?.[locale.value]?.[key] || _item.domains?.[route.params.domain as string]?.status || '';
};

/**
 * Headers that are used by multiple tables, thus it makes sense to define them in one place
 */
const defaultHeaders: { [key: string]: TableHeader } = {
  icon: {
    value: 'icon',
    key: 'icon',
    sortable: false,
    text: '',
    class: ['pr-0'],
    cellClass: ['pr-0'],
    width: 30,
    render: renderIcon,
    priority: 70,
    order: 10
  },
  designator: {
    value: 'designator',
    key: 'designator',
    sortable: true,
    width: 110,
    priority: 90,
    order: 20
  },
  abbreviation: {
    value: 'abbreviation',
    key: 'abbreviation',
    sortable: true,
    truncate: true,
    width: 80,
    priority: 60,
    order: 30
  },
  name: {
    value: 'name',
    key: 'name',
    cellClass: ['font-weight-bold'],
    width: 300,
    truncate: true,
    sortable: true,
    priority: 100,
    order: 40
  },
  status: {
    value: 'status',
    key: 'status',
    sortable: false,
    width: 110,
    render: renderStatus,
    priority: 40,
    order: 50
  },
  description: {
    value: 'description',
    key: 'description',
    sortable: false,
    width: 500,
    truncate: true,
    tooltip: ({ item }) => item.raw.description,
    priority: 30,
    order: 60
  },
  updatedBy: {
    value: 'updatedBy',
    key: 'updatedBy',
    sortable: true,
    truncate: true,
    width: 80,
    priority: 50,
    order: 70
  },
  updatedAt: {
    value: 'updatedAt',
    key: 'updatedAt',
    sortable: true,
    width: 100,
    tooltip: renderUpdatedAtTooltip,
    render: renderDate,
    priority: 80,
    order: 80
  }
};

// We assume all headers not matching here are defind in BaseTable.vue, so we pass them along
const unmatchedDefaultHeaders = computed(() => props.defaultHeaders.filter((header) => !defaultHeaders[header]));

// Merge default headers from object table with additional headers
const mergedAdditionalHeaders = computed(() => [
  ...props.defaultHeaders.map((header) => defaultHeaders[header]).filter(header => header),
  ...props.additionalHeaders
]);
</script>

<i18n>
{
  "en": {
    "by": "by",
    "createdAt": "Created",
    "loadingData": "Loading data...",
    "updatedAt": "Updated"
  },
  "de": {
    "by": "von",
    "createdAt": "Erstellt",
    "loadingData": "Daten werden geladen",
    "updatedAt": "Aktualisiert"
  }
}
</i18n>
