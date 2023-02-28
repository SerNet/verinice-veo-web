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
<script lang="ts">
import { PropType, VNode, VNodeArrayChildren } from 'vue';
import { VProgressLinear, VTooltip } from 'vuetify/components';
import { VDataTable, VDataTableServer } from 'vuetify/labs/VDataTable';
import type { SortItem } from 'vuetify/labs/VDataTable/composables/sort.mjs';
import type { DataTableHeader } from 'vuetify/labs/VDataTable/types.mjs';
import { cloneDeep, omit } from 'lodash';

import ObjectIcon from '~/components/object/Icon.vue';
import { IVeoPaginatedResponse } from '~/types/VeoTypes';
import { useFormatters } from '~/composables/utils';
import { separateUUIDParam } from '~/lib/utils';
import { useVeoUser } from '~/composables/VeoUser';
import { useFetchTranslations } from '~/composables/api/translations';

export type ObjectTableFormatter = (value: any) => string;
export type ObjectTableTooltip = (value: any) => string;
export type ObjectTableRenderer = (props: { item: any; value: any }) => VNode | VNode[] | string | (() => VNode | VNode[] | string);

interface ObjectTableHeaderAdditionalProperties {
  priority: number;
  order: number;
  truncate?: boolean;
  map?: ObjectTableFormatter;
  text?: string;
  render?: ObjectTableRenderer;
  tooltip?: ObjectTableRenderer;
  value: keyof any | string;
}

export type ObjectTableHeader = Omit<DataTableHeader, 'text'> & ObjectTableHeaderAdditionalProperties;

export type ExtractProperty<V extends ReadonlyArray<Record<string, any>>, K extends keyof V[0]> = V extends ReadonlyArray<Record<K, infer U>> ? U : never;

/**
 * This component is designed to reduce code duplications for tables that use the same or similar columns across the application.
 * Furthermore it enhances the default vuetify table by only displaying the columns that fit the available space.
 * Can be used for paginated data (that uses the IVeoPaginatedReponse interface) and default arrays
 */
export default defineComponent({
  props: {
    /**
     * Items can be IVeoPaginatedResponse or an array.
     */
    items: {
      type: [Object, Array] as PropType<IVeoPaginatedResponse<any> | any[]>,
      default: () => []
    },
    /**
     * Displays a loading indicator. Works regardless of PaginatedResponse or array
     */
    loading: {
      type: Boolean,
      default: false
    },
    /**
     * Array containing all elements selected in the table. As the stringified value is used by vuetify, internally we only select by id
     */
    modelValue: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    /**
     * Reflects the current page displayed in the table. Can be used with paginated data and simple arrays.
     */
    page: {
      type: Number,
      default: 1
    },
    /**
     * Defines how the table should be sorted.
     * NOTE: Paginated data can only be sorted by one column, all entries besides [0] will be ignored.
     */
    sortBy: {
      type: Array as PropType<SortItem[]>,
      default: () => [{ key: 'name', order: 'desc' }]
    },
    /**
     * Keys of the default columns defined in the VeoObjectTable that should get shown.
     */
    defaultHeaders: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    /**
     * Array containing additional table headers that should get shown besides the default headers.
     */
    additionalHeaders: {
      type: Array as PropType<ObjectTableHeader[]>,
      default: () => []
    },
    /**
     * Force-show all columns, even if this makes the table scrollable on the x-axis.
     */
    showAllColumns: {
      type: Boolean,
      default: false
    },
    // Needed as we can't check whether @click is set in the attrs as soon as it is defiend as an emit.
    enableClick: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'update:sort-by',
    'update:page',
    'update:items-per-page',
    'click', 'update:model-value'
  ],
  setup(props, { emit, slots, attrs }) {
    const { t, locale } = useI18n();
    const { t: $t } = useI18n({ useScope: 'global' });
    const route = useRoute();
    const { tablePageSize } = useVeoUser();
    const vm = getCurrentInstance();
    const { formatDateTime } = useFormatters();

    const translationQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useFetchTranslations(translationQueryParameters);

    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);

    // Local sortBy and page property. Used so the table can be paginated if the props aren't set. synced by watchers.
    const localPage = ref(props.page);
    watch(() => localPage.value, (newValue) => {
      emit('update:page', newValue);
    });
    watch(() => props.page, (newValue) => {
      localPage.value = newValue;
    });
    const localSortBy = ref(props.sortBy);
    watch(() => localSortBy.value, (newValue) => {
      emit('update:sort-by', newValue);
    });
    watch(() => props.sortBy, (newValue) => {
      localSortBy.value = newValue;
    });

    /**
     * Distinguish between IVeoPaginatedResponse and basic arrays
     */
    const isPaginatedResponse = computed(() => 'items' in props.items && 'page' in props.items && 'pageCount' in props.items && 'totalItemCount' in props.items);
    /**
     * Format date via i18n
     */
    const formatDate: ObjectTableFormatter = (v) => {
      try {
        return formatDateTime(new Date(v)).value;
      } catch (e) {
        return '';
      }
    };
    /**
     * Render translated status
     */
    const renderStatus: ObjectTableRenderer = ({ item }) => {
      const _item = item.raw;
      if (!domainId.value) return '';
      const domainDetails = _item.domains?.[domainId.value];
      const key = `${_item.type}_${domainDetails?.subType}_status_${domainDetails?.status}`;
      return translations.value?.lang?.[locale.value]?.[key] || _item.domains?.[domainId.value]?.status || '';
    };
    /**
     * Render folder or file icons
     */
    const renderIcon: ObjectTableRenderer = ({ item }) =>
      h(ObjectIcon, {
        objectType: item.raw.type,
        isComposite: !!item.raw.parts?.length
      });
    /**
     * Render date column using date formatter
     */
    const renderDate: ObjectTableRenderer = ({ item }) => (item.raw.updatedAt ? formatDate(item.raw.updatedAt) : '');
    /**
     * Render created at / updated at tooltip
     */
    const renderUpdatedAtTooltip: ObjectTableRenderer = ({ item }) => {
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
     * Render actions slot (aligned right, stopping click propagation)
     */
    const renderActions: ObjectTableRenderer = (context) =>
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

    /**
     * Headers that are used by multiple tables, thus it makes sense to define them in one place
     */
    const defaultHeaders: { [key: string]: ObjectTableHeader } = {
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
        tooltip: ({ item }) => item.raw.description || '',
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
      },
      actions: {
        value: 'actions',
        key: 'actions',
        text: '',
        sortable: false,
        width: 80,
        render: renderActions,
        priority: 100,
        order: 90
      }
    };

    /**
     * Default header classes
     */
    const defaultClasses: string[] = [];
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
    const renderValue = (item: any, key: keyof any | string) => (key in item.raw ? String(item.raw[key]) : '');
    /**
     * Convert ObjectTableRenderer to VNode array
     */
    const toNodeChildren = (items: ReturnType<ObjectTableRenderer>): VNodeArrayChildren => ([] as (VNode | string)[]).concat(items as VNode[]);
    /**
     * Render a tooltip for a cell
     */
    const renderTooltip = (header: ObjectTableHeader, data?: any): ObjectTableRenderer => {
      return (props) => {
        const children = header.render ? toNodeChildren(header.render(props)) : renderValue(props.item, header.value);
        return h(VTooltip, {
          location: 'bottom',
          width: 350
        }, {
          activator: ({ attrs, props }: { attrs: Record<string, any>, props: Record<string, any> }) => h('span', { attrs, ...props, ...data }, children),
          default: () => header.tooltip?.(props)
        });
      };
    };
    /**
     * Prepare headers for v-data-table, applying classes and tooltip renderers
     */
    const _headers = computed<ObjectTableHeader[]>(() =>
      [
        ...Object.entries(defaultHeaders)
          .filter(([key, _header]) => props.defaultHeaders.includes(key))
          .map(([_key, header]) => header),
        ...props.additionalHeaders
      ]
        .map((header) => {
          const cellClass = defaultCellClasses.concat(header.cellClass || [], header.truncate ? truncateClasses : []);
          return {
            ...header,
            title: header.text ?? $t(`objectlist.${String(header.value)}`),
            cellClass,
            class: defaultClasses.concat(header.class || [], header.truncate ? truncateClasses : []),
            render: header.tooltip ? renderTooltip(header, { class: cellClass, style: { maxWidth: `${header.width}px`, display: 'block' }}) : header.render
          };
        })
        .sort((a, b) => a.order - b.order)
    );

    // Apply formatters to items:
    const mappers = _headers.value.filter((_) => !!_.map);
    const mapItem = (item: any) => {
      const mappedValues = Object.fromEntries(
        mappers.map((formatter) => {
          const name = formatter.value;
          const value = formatter.map ? formatter.map(item[name]) : item[name];
          return [name, value];
        })
      );
      return { ...item, ...mappedValues };
    };

    const items = computed(() => (isPaginatedResponse.value ? (props.items as IVeoPaginatedResponse<any>).items : props.items).map(mapItem));

    /**
     * Create slots to apply renderers
     */
    const renderers = computed(() => Object.fromEntries(_headers.value.filter((header) => !!header.render).map((header) => [`item.${header.key}`, header.render])));

    /**
     * Calculate which columns should be shown based on overflow
     */
    // The headers actually displayed. This changes based on space available (resizeObserver).
    const displayedHeaders = ref<ObjectTableHeader[]>(_headers.value);

    // Normalized headers (not existing props get removed)
    const normalizedDisplayHeaders = computed<DataTableHeader[]>(() => displayedHeaders.value.map((header) => omit(header, 'priority', 'order', 'truncate', 'map', 'text', 'render', 'tooltip', 'value')));

    const calculateTableWidth = (headers: ObjectTableHeader[]) =>
      headers.reduce((previousValue, currentValue) => {
        // The 32 is the left and right padding of each cell
        previousValue += Number(currentValue.width || 0) + 32;
        return previousValue;
      }, 0);

    const indexOfHeaderWithLowestPriority = (headers: ObjectTableHeader[]) => {
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
        displayedHeaders.value = _headers.value;
        return;
      }
      if (tableWrapper.value) {
        const tableWrapperWidth = tableWrapper.value.$el.clientWidth;

        const headers = cloneDeep(_headers.value);

        // We use a for loop instead of a while loop to avoid creating an endless loop (normally shouldn't happen, but can't go wrong with precaution)
        for (let i = 0; i < _headers.value.length; i++) {
          if (calculateTableWidth(headers) > tableWrapperWidth) {
            const leastImportantHeaderIndex = indexOfHeaderWithLowestPriority(headers);

            // If undefined, no header is left, so leave the loop.
            // Also we always want at least one column to be shown.
            // Also leave if the least important header has priority 100, as those headers should always be shown
            if (leastImportantHeaderIndex === undefined || headers.length <= 1 || headers[leastImportantHeaderIndex].priority === 100) {
              break;
            }
            headers.splice(leastImportantHeaderIndex, 1);

            // If the remaining headers width is equal or lower than the width of the table, we can exit as the table now fits
          } else {
            break;
          }
        }

        displayedHeaders.value = headers;
      }
    };

    watch(() => _headers.value, onTableWidthChange);

    const resizeObserver = new ResizeObserver(onTableWidthChange);

    const tableWrapper = ref();
    watch(() => tableWrapper.value, (newValue, oldValue) => {
      if(newValue) {
        resizeObserver.observe(newValue.$el);
      } else {
        resizeObserver.unobserve(oldValue.$el);
      }
    });

    // Internal model value (to only use id's internally but return full objects)
    const internalModelValue = computed({
      get: () => props.modelValue.map((item) => item.id),
      set: (newValue: any[]) => {
        if(newValue.length > props.modelValue.length) {
          const addedId = newValue.find((id) => !props.modelValue.find((item) => item.id === id));
          const _items = isPaginatedResponse.value ? (props.items as IVeoPaginatedResponse<any[]>).items : props.items as any[];
          emit('update:model-value', [ ...props.modelValue, _items.find((item) => item.id === addedId) ]);
        } else {
          const missingId = props.modelValue.findIndex((item) => !newValue.includes(item.id));
          const itemsToModify =  cloneDeep(props.modelValue);
          itemsToModify.splice(missingId, 1);
          emit('update:model-value', itemsToModify);
        }
      }
    });

    const sharedProps = computed(() => ({
      ...attrs,
      class: props.enableClick ? 'cursor-pointer' : '',
      id: `veo-object-table-${vm?.uid}`,
      items: items.value,
      itemsPerPage: tablePageSize.value,
      modelValue: internalModelValue.value,
      mustSort: true,
      headers: normalizedDisplayHeaders.value,
      page: localPage.value,
      sortBy: localSortBy.value,
      ...(props.enableClick || 'show-select' in attrs
        ? {
          'onClick:row': (_item: any, context: any) => {
            if ('show-select' in attrs) {
              // TODO-vuetify: Reenable once context is available again
              // context.select(!context.isSelected);
            } else {
              emit('click', context);
            }
          }
        }
        : {}),
      'onUpdate:modelValue': (newValue: string[]) => internalModelValue.value = newValue,
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
      ref: tableWrapper,
      'data-table-sorted-column-name': localSortBy.value[0].key,
      'data-table-sort-order': localSortBy.value[0].order
    }));

    return () => isPaginatedResponse.value ?
      h(VDataTableServer, {
        ...attrs,
        ...sharedProps.value,
        loading: props.loading,
        loadingText: t('loadingData'),
        itemsLength: (props.items as IVeoPaginatedResponse<any>).totalItemCount
      }, {
        ...slots,
        ...renderers.value
      })
      : h('div', [
        ...(props.loading ? [h(VProgressLinear, { indeterminate: true, color: 'primary' })] : []),
        h(VDataTable, {
          ...attrs,
          ...sharedProps.value
        }, {
          ...slots,
          ...renderers.value
        })
      ]);
  }
});
</script>
<style lang="scss" scoped>
:deep(*) {
  .cursor-pointer .v-data-table__tr {
    cursor: pointer;
  }
}
</style>
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