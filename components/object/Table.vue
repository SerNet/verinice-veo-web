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
    v-model="toRef(modelValue).value"
    v-bind="mergeProps(props, attrs)"
    :additional-headers="mergedAdditionalHeaders"
    :default-headers="unmatchedDefaultHeaders"
    :show-select="showSelect"
    @update:model-value="emit('update:model-value', $event)"
    @update:items-per-page="emit('update:items-per-page', $event)"
    @update:page="emit('update:page', $event)"
    @update:sort-by="emit('update:sort-by', $event)"
    @click="emit('click', $event)"
  >
    <template v-for="(_, name) in slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
import { mergeProps } from 'vue';

import type { SortItem, TableFormatter, TableHeader, TableRenderer } from '~/components/base/Table.vue';
import ObjectIcon from '~/components/object/Icon.vue';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';
import { useFormatters } from '~/composables/utils';
import { IVeoPaginatedResponse } from '~/types/VeoTypes';

const props = withDefaults(
  defineProps<{
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
    /**
     * Text to display when there is no data to show in the table.
     * This text will be shown in place of the table when `items` array is empty.
     */
    noDataText?: () => any;
    showSelect?: boolean;
  }>(),
  {
    items: () => [],
    loading: false,
    modelValue: () => [],
    sortBy: () => [{ key: 'name', order: 'asc' }],
    defaultHeaders: () => [],
    additionalHeaders: () => [],
    showAllColumns: false,
    enableClick: false,
    noDataText: () => '',
    showSelect: false
  }
);

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

const translationQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain
}));
const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, translationQueryParameters);

/**
 * Render folder or file icons
 */
const renderIcon: TableRenderer = ({ item }) => {
  return h(ObjectIcon, {
    objectType: item.type,
    isComposite: !!item.parts?.length
  });
};
/**
 * Render date column using date formatter
 */
const renderDate: TableRenderer = ({ internalItem: item }) =>
  h('span', { 'data-veo-test': 'updatedAt' }, `${item.raw.updatedAt ? formatDate(item.raw.updatedAt) : ''}`);

/**
 * Render created at / updated at tooltip
 */
const renderUpdatedAtTooltip: TableRenderer = ({ internalItem: item }) => {
  return h('table', [
    item.raw.createdAt ?
      [
        h('tr', [
          h('td', [t('createdAt').toString(), ': ']),
          h('td', [
            h('strong', formatDate(item.raw.createdAt) || '???'),
            ' ',
            t('by').toString(),
            ' ',
            h('strong', item.raw.createdBy)
          ])
        ])
      ]
    : [],
    item.raw.updatedAt ?
      [
        h('tr', [
          h('td', [t('updatedAt').toString(), ': ']),
          h('td', [
            h('strong', formatDate(item.raw.updatedAt) || '???'),
            ' ',
            t('by').toString(),
            ' ',
            h('strong', item.raw.updatedBy)
          ])
        ])
      ]
    : []
  ]);
};

/**
 * Format date via i18n
 */
const formatDate: TableFormatter = (v: any) => {
  try {
    return formatDateTime(new Date(v)).value;
  } catch (e: any) {
    return `${e.message}`;
  }
};

/**
 * Render translated status
 */
const renderStatus: TableRenderer = ({ item }: { item: any }) => {
  const key = `${item.type}_${item.subType}_status_${item.status}`;
  //return translations.value?.lang?.[locale.value]?.[key] || item?.status || '';
  return h('div', { 'data-veo-test': 'status' }, [
    `${translations.value?.lang?.[locale.value]?.[key] || item?.status || ''}`
  ]);
};
/**
 * Headers that are used by multiple tables, thus it makes sense to define them in one place
 */

const recurringHeaders: { [key: string]: TableHeader } = {
  icon: {
    value: 'icon',
    key: 'icon',
    sortable: false,
    text: '',
    // @ts-ignore TODO #3066 does not exist
    class: ['pr-0'],
    cellClass: ['pr-0'],
    width: 30,
    render: renderIcon,
    priority: 100,
    order: 10
  },
  designator: {
    value: 'designator',
    key: 'designator',
    sortable: true,
    width: 110,
    priority: 40,
    order: 20
  },
  abbreviation: {
    value: 'abbreviation',
    key: 'abbreviation',
    sortable: true,
    truncate: true,
    width: 80,
    priority: 100,
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
    priority: 100,
    order: 50
  },
  description: {
    value: 'description',
    key: 'description',
    sortable: false,
    width: 500,
    truncate: true,
    tooltip: ({ internalItem: item }) => item.raw.description,
    priority: 30,
    order: 60
  },
  updatedAt: {
    value: 'updatedAt',
    key: 'updatedAt',
    sortable: true,
    width: 100,
    tooltip: renderUpdatedAtTooltip,
    render: renderDate,
    priority: 80,
    order: 70
  },
  updatedBy: {
    value: 'updatedBy',
    key: 'updatedBy',
    sortable: true,
    truncate: true,
    width: 80,
    priority: 40,
    order: 80
  },type: {
    value: 'type',
    key: 'type',
    sortable: true,
    truncate: true,
    width: 80,
    priority: 40,
    order: 80
  }
};

// We assume all headers not matching here are defind in BaseTable.vue, so we pass them along
const unmatchedDefaultHeaders = computed(() => props.defaultHeaders.filter((header) => !recurringHeaders[header]));

// Merge default headers from object table with additional headers
const mergedAdditionalHeaders = computed(() => [
  ...(props.defaultHeaders || []).map((header) => recurringHeaders[header]).filter((header) => header),
  ...props.additionalHeaders
]);
</script>

<i18n src="~/locales/base/components/object-table.json"></i18n>
