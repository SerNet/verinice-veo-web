<!--
   - verinice.veo web
   - Copyright (C) 2023 Markus Werner, Jonas Heitmann
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
  <component :is="render" />
</template>

<script lang="ts">
/**
 * This component enhances the default vuetify table by only displaying the columns that fit the available space.
 * Base for advanced tables like ObjectTable that further reduce code duplication.
 * Can be used for paginated data (that uses the IVeoPaginatedResponse interface) and default arrays
 */

import { cloneDeep, omit } from 'lodash';
import { Slot, VNode, VNodeArrayChildren } from 'vue';
import { VCheckbox, VIcon, VProgressLinear, VTooltip } from 'vuetify/components';
import { VDataTable, VDataTableServer } from 'vuetify/components/VDataTable';

import type { VDataTableHeaders } from 'vuetify/components/VDataTable';
import { useVeoUser } from '~/composables/VeoUser';
import { type IVeoPaginatedResponse } from '~/types/VeoTypes';

export type TableFormatter = (value: any) => string;
export type TableRenderer = (
  props: { item: any; internalItem: any; value: any },
  header?: TableHeader
) => VNode | VNode[] | string | (() => VNode | VNode[] | string);

interface TableHeaderAdditionalProperties {
  priority: number;
  order: number;
  truncate?: boolean;
  map?: TableFormatter;
  text?: string;
  headerIcon?: string;
  render?: TableRenderer;
  tooltip?: TableRenderer;
  value?: keyof any | string;
  key: string;
  sortable?: boolean;
  width?: number;
  cellClass?: string[];
}

export type TableHeader = Partial<Omit<VDataTableHeaders, 'text'>> & TableHeaderAdditionalProperties;

export type ExtractProperty<V extends ReadonlyArray<Record<string, any>>, K extends keyof V[0]> =
  V extends ReadonlyArray<Record<K, infer U>> ? U : never;
</script>

<script setup lang="ts">
export interface SortItem {
  key: string;
  order: string;
}

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
     * Reflects the current page displayed in the table. Can be used with paginated data and simple arrays.
     */
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
    noDataText?: Slot;
    /**
     * Boolean to show the select checkbox column.
     * @default false
     */
    showSelect?: boolean;
    /**
     * Boolean to show the compact view.
     * @default false
     */
    compact?: boolean;
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
    noDataText: undefined,
    showSelect: false
  }
);

const emit = defineEmits<{
  (e: 'update:sort-by', newSorting: SortItem[]): void;
  (e: 'update:items-per-page', newItemsPerPage: number): void;
  (e: 'click', event: any): void;
  (e: 'update:model-value', newValue: any[]): void;
}>();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { tablePageSize } = useVeoUser();
const vm = getCurrentInstance();
const slots = useSlots();
const attrs = useAttrs();
const route = useRoute();

/** @description Synchronizes the current API page parameter with the parent component, 0-indexed */
const page = defineModel<number>('page', { default: 0 });

/** @description Tracks the current page state of VDataTable, has to be 1-indexed. */
const localPage = ref(1);

watch(
  () => page,
  (newValue) => {
    localPage.value = newValue.value + 1;
  },
  { immediate: true, deep: true }
);

watch(
  () => localPage.value,
  (newValue) => {
    page.value = newValue - 1;
  }
);

const localSortBy = ref(props.sortBy);
watch(
  () => localSortBy.value,
  (newValue) => {
    emit('update:sort-by', newValue);
  }
);
watch(
  () => props.sortBy,
  (newValue) => {
    localSortBy.value = newValue;
  }
);

/**
 * Distinguish between IVeoPaginatedResponse and basic arrays
 */
const isPaginatedResponse = <T = any[],>(items: any | T): items is IVeoPaginatedResponse<T> =>
  'items' in items && 'page' in items && 'pageCount' in items && 'totalItemCount' in items;
/**
 * Render actions slot (aligned right, stopping click propagation)
 */
const renderActions: TableRenderer = (context) =>
  h(
    'div',
    {
      class: 'text-right',
      onClick(e: Event) {
        // do not emit row:click events for actions
        e.stopImmediatePropagation();
      }
    },
    {
      default: () => slots.actions?.(context)
    }
  );

const toggleSelection = (context: any) => {
  if (context.item.disabled) {
    return;
  }
  const newModelValue: any[] = cloneDeep(internalModelValue.value);
  const existingIndex = newModelValue.findIndex((existingId) => existingId === context.internalItem.value);
  if (existingIndex !== -1) {
    newModelValue.splice(existingIndex, 1);
  } else {
    newModelValue.push(context.internalItem.value);
  }
  internalModelValue.value = newModelValue;
};

/**
 * Headers that are used by multiple tables, thus it makes sense to define them in one place
 */
const presetHeaders: { [key: string]: TableHeader } = {
  'data-table-select': {
    value: 'data-table-select',
    key: 'data-table-select',
    sortable: false,
    width: 50,
    priority: 100,
    order: 0,
    text: '',
    render: (context) => {
      const isSelected = internalModelValue.value.includes(context.internalItem.value);
      const itemValue = context.internalItem.value;
      const mainCheckBox = document.querySelector('table thead input[type="checkbox"][id^="input-"]');
      const checkbox = document.querySelector(`#checkbox-${itemValue}`);
      const ariaLabel = isSelected ? t('deselect') : t('selectAll');
      const ariaLabelRow = isSelected ? t('deselectRow') : t('selectRow');

      if (checkbox) {
        checkbox.setAttribute('aria-label', ariaLabelRow);
        mainCheckBox.setAttribute('aria-label', ariaLabel);
      }
      return h(VCheckbox, {
        id: `checkbox-${context.internalItem.value}`,
        indeterminate: false,
        modelValue: isSelected,
        color: isSelected ? 'primary' : undefined,
        density: props.compact ? 'compact' : 'default',
        disabled: context.internalItem.raw.disabled,
        hideDetails: true,
        'aria-checked': isSelected ? 'true' : 'false',
        'onUpdate:model-value': () => toggleSelection(context),
        style:
          props.compact ?
            {
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              overflow: 'visible'
            }
          : {}
      });
    }
  },
  actions: {
    value: 'actions',
    key: 'actions',
    sortable: false,
    width: 80,
    render: renderActions,
    priority: 100,
    order: 90
  }
};

/**
 * Default cell classes
 */
const defaultCellClasses = ['flex-nowrap', 'text-no-wrap'];
/**
 * Classes to apply when truncate is set
 */
const truncateClasses = ['text-truncate'];

/**
 * Render value inside a cell
 */
const renderValue = (item: any, key: keyof any | string) => (key in item ? String(item[key]) : '');
/**
 * Convert TableRenderer to VNode array
 */
const toNodeChildren = (items: ReturnType<TableRenderer>): VNodeArrayChildren =>
  ([] as (VNode | string)[]).concat(items as VNode[]);
/**
 * Render a tooltip for a cell
 */
const renderTooltip = (header: TableHeader, data?: any): TableRenderer => {
  return (props) => {
    const children = header.render ? toNodeChildren(header.render(props)) : renderValue(props.item, header.value);
    return h(
      VTooltip,
      {
        location: 'bottom',
        width: 350,
        title: header.tooltip ? header.tooltip(props) : header.text || 'cell'
      },
      {
        activator: ({ attrs: slotAttrs, props: slotProps }: { attrs: any; props: any }) =>
          h('span', { slotAttrs, ...slotProps, ...data }, children),
        default: () => header.tooltip?.(props)
      }
    );
  };
};
/**
 * Prepare headers for v-data-table, applying classes and tooltip renderers
 */
const getHeaderTitle = (header: TableHeader) => {
  if (header.headerIcon) {
    return h('span', [
      h(VIcon, {
        icon: header.headerIcon,
        size: 'small'
      })
    ]);
  }
  return header.text ?? globalT(`objectlist.${String(header.value)}`);
};

const _headers = computed<TableHeader[]>(() => {
  const filteredHeaders = Object.entries(presetHeaders)
    .filter(([key]) => props.defaultHeaders.includes(key) || (key === 'data-table-select' && props.showSelect))
    .map(([, header]) => header);

  const headers = [...filteredHeaders, ...props.additionalHeaders];

  return headers
    .map((header) => {
      const cellClass = [
        ...defaultCellClasses,
        ...(header.cellClass || []),
        ...(header.truncate ? truncateClasses : []),
        props.enableClick ? 'cursor-pointer' : 'cursor-default'
      ];

      return {
        ...header,
        title: getHeaderTitle(header),
        cellClass,
        // @ts-ignore TODO #3066 class does not exist
        class: [...(header.class || []), ...(header.truncate ? truncateClasses : [])],
        render:
          header.tooltip ?
            renderTooltip(header, {
              class: cellClass,
              style: { maxWidth: `${header.width}px`, display: 'block' }
            })
          : header.render
      };
    })
    .sort((a, b) => a.order - b.order);
});

// Apply formatters to items:
const mappers = _headers.value.filter((_) => !!_.map);
const mapItem = (item: any) => {
  const mappedValues = Object.fromEntries(
    mappers.map((formatter) => {
      const name = formatter.value;
      const value = formatter.map ? formatter.map(item[name || '']) : item[name || ''];
      return [name, value];
    })
  );
  return { ...item, ...mappedValues };
};

const items = computed(() => {
  const data = isPaginatedResponse(props.items) ? props.items.items : props.items;

  return (data || []).map(mapItem);
});

/**
 * Create slots to apply renderers. If none exists, use a default one in order to display disabled table entries
 */

const defaultRenderer: TableRenderer = (context: any, header) => {
  const column = context.column;
  return h(
    'div',
    {
      class: [
        ...column.cellClass,
        ...column.class,
        ...(context.internalItem.raw.disabled ? ['v-list-item--disabled'] : [])
      ],
      'data-veo-test': column.key
    },
    header?.key ? context.internalItem.columns[header.key] : undefined
  );
};
const renderers = computed(() =>
  Object.fromEntries(
    _headers.value.map((header) => [
      `item.${header.key}`,
      (context: any) => (header.render ? header.render(context) : defaultRenderer(context, header))
    ])
  )
);

/**
 * Calculate which columns should be shown based on overflow
 */
// The headers actually displayed. This changes based on space available (resizeObserver).
const displayedHeaders = ref<TableHeader[]>(_headers.value);

// Normalized headers (not existing props get removed)
// @ts-ignore TODO #3066 cannot find name
const normalizedDisplayHeaders = computed<DataTableHeader[]>(() =>
  // @ts-ignore TODO #3066 type instantiation is excessively deep
  displayedHeaders.value.map((header) =>
    omit(header, 'priority', 'order', 'truncate', 'map', 'text', 'render', 'tooltip', 'value')
  )
);

const calculateTableWidth = (headers: TableHeader[]) =>
  headers.reduce((previousValue, currentValue) => {
    // The 32 is the left and right padding of each cell
    previousValue += Number(currentValue.width || 0) + 32;
    return previousValue;
  }, 0);

const indexOfHeaderWithLowestPriority = (headers: TableHeader[]) => {
  if (!headers.length) {
    return undefined;
  }

  let lowestImportanceHeaderIndex = 0;
  let lowestImportance = Infinity;
  for (const index in headers) {
    if (headers[index].priority < lowestImportance) {
      lowestImportanceHeaderIndex = Number(index);
      lowestImportance = headers[index].priority;
    }
  }
  return lowestImportanceHeaderIndex;
};

const onTableWidthChange = () => {
  if (props.showAllColumns) {
    // @ts-ignore TODO #3066 not assignable
    displayedHeaders.value = _headers.value;
    return;
  }
  if (tableWrapper.value) {
    const tableWrapperWidth = tableWrapper.value.$el.clientWidth;

    const headers = [..._headers.value];

    // We use a for loop instead of a while loop to avoid creating an endless loop (normally shouldn't happen, but can't go wrong with precaution)
    for (let i = 0; i < _headers.value.length; i++) {
      if (calculateTableWidth(headers) > tableWrapperWidth) {
        const leastImportantHeaderIndex = indexOfHeaderWithLowestPriority(headers);

        // If undefined, no header is left, so leave the loop.
        // Also we always want at least one column to be shown.
        // Also leave if the least important header has priority 100, as those headers should always be shown
        if (
          leastImportantHeaderIndex === undefined ||
          headers.length <= 1 ||
          headers[leastImportantHeaderIndex].priority === 100
        ) {
          break;
        }
        headers.splice(leastImportantHeaderIndex, 1);

        // If the remaining headers width is equal or lower than the width of the table, we can exit as the table now fits
      } else {
        break;
      }
    }

    // @ts-ignore TODO #3066 not assignable
    displayedHeaders.value = headers;
  }
};

watch(() => _headers.value, onTableWidthChange);

const resizeObserver = new ResizeObserver(onTableWidthChange);

const tableWrapper = ref();
watch(tableWrapper, (newValue, oldValue) => {
  if (oldValue?.$el) resizeObserver.unobserve(oldValue.$el);
  if (newValue?.$el) resizeObserver.observe(newValue.$el);
});

onUnmounted(() => resizeObserver.disconnect());

// Internal model value. Used so the data table can work with strings, while returning fully qualified objects. Used as otherwise already selected items won't get shown as selected
const internalModelValue = computed({
  get: () => props.modelValue.map((item) => item.id),
  set: (newValue: string[]) => {
    const availableCurrentItems = isPaginatedResponse(props.items) ? props.items.items : (props.items as any[]);
    const availablePreviousItems = props.modelValue;
    emit(
      'update:model-value',
      newValue.map(
        (newValue) =>
          availableCurrentItems.find((item) => item.id === newValue) ||
          availablePreviousItems.find((item) => item.id === newValue)
      )
    );
  }
});

const itemsPerPageOptions = [
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' }
];

const sharedProps = computed(() => {
  function handleRowClick(event: PointerEvent, context: any) {
    if (props.enableClick && !isCheckboxClick(event)) {
      handleRowEvent(event, context);
    } else if (props.showSelect) {
      toggleSelection(context);
    }

    function isCheckboxClick(event: PointerEvent) {
      return (event.target as Element)?.closest('.v-checkbox');
    }

    function handleRowEvent(event: PointerEvent, context: any) {
      event.stopImmediatePropagation();
      emit('click', context);
    }
  }
  // Extract complex event handlers into separate variables
  const onClickRowHandler =
    props.enableClick || props.showSelect ?
      {
        'onClick:row': handleRowClick
      }
    : {};

  return {
    // Spread attributes first to allow overrides
    ...attrs,
    id: `veo-object-table-${vm?.uid}`,
    items: items.value,
    itemsPerPage: tablePageSize.value,
    itemsPerPageOptions: itemsPerPageOptions,
    modelValue: internalModelValue.value,
    mustSort: true,
    headers: normalizedDisplayHeaders.value,
    page: localPage.value,
    sortBy: localSortBy.value,

    // Spread conditional event handlers
    ...onClickRowHandler,

    // Update handlers
    'onUpdate:modelValue': (newValue: string[]) => {
      internalModelValue.value = newValue;
    },
    'onUpdate:page': (newValue: number) => {
      localPage.value = newValue;
    },
    'onUpdate:itemsPerPage': (newValue: number) => {
      tablePageSize.value = newValue;
      emit('update:items-per-page', newValue);
    },
    'onUpdate:sortBy': (newValue: SortItem[]) => {
      localSortBy.value = newValue;
    },

    // References and data attributes
    ref: tableWrapper,
    'data-table-sorted-column-name': localSortBy.value[0]?.key,
    'data-table-sort-order': localSortBy.value[0]?.order
  };
});

const render = () => {
  const dataTableProps = {
    ...sharedProps.value,
    loading: props.loading,
    loadingText: t('loadingData'),
    itemsLength: props.items.totalItemCount,
    ...(props.loading ? { 'data-veo-test': 'loadingDataTable' } : { 'data-veo-test': 'loadedDataTable' })
  };

  let dataTableSlots = {
    ...slots,
    ...renderers.value
  };

  if (props.noDataText) {
    dataTableSlots = {
      ...dataTableSlots,
      'no-data': props.noDataText
    };
  }

  if (isPaginatedResponse(props.items)) {
    // @ts-ignore TODO #3066 no overload matches the call
    return h(VDataTableServer, dataTableProps, dataTableSlots);
  } else {
    const dataTableContent = props.loading ? [h(VProgressLinear, { indeterminate: true, color: 'primary' })] : [];

    // @ts-ignore TODO #3066 no overload matches the call
    return h('div', [...dataTableContent, h(VDataTable, dataTableProps, dataTableSlots)]);
  }
};
</script>

<i18n src="~/locales/base/components/base-table.json"></i18n>

<style lang="scss" scoped>
:deep(*) {
  .cursor-default {
    cursor: default;
  }

  .cursor-pointer {
    cursor: pointer;
  }
}
</style>
