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
import {
  computed,
  defineComponent,
  PropType,
  h,
  useContext,
  useAsync,
  useRoute,
  ComputedRef,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch
} from '@nuxtjs/composition-api';
import { VNode, VNodeChildren, VNodeData } from 'vue/types/vnode';
import { useI18n } from 'nuxt-i18n-composable';
import { DataTableHeader } from 'vuetify/types';
import { VDataTable, VTooltip } from 'vuetify/lib';
import { cloneDeep } from 'lodash';

import VeoObjectIcon from '~/components/objects/VeoObjectIcon.vue';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { useThrottleNextTick } from '~/composables/utils';
import { separateUUIDParam } from '~/lib/utils';

export type ObjectTableItems = IVeoPaginatedResponse<IVeoEntity[]> | Array<IVeoEntity>;

export type ObjectTableFormatter = (value: any) => string;
export type ObjectTableTooltip = (value: any) => string;
export type ObjectTableRenderer = (props: { item: IVeoEntity; value: any }) => VNode | VNode[] | string;

export interface ObjectTableHeader extends Omit<DataTableHeader, 'text'> {
  priority: number;
  order: number;
  truncate?: boolean;
  map?: ObjectTableFormatter;
  text?: string;
  render?: ObjectTableRenderer;
  tooltip?: ObjectTableRenderer;
  value: keyof IVeoEntity | string;
}

export type ExtractProperty<V extends ReadonlyArray<Record<string, any>>, K extends keyof V[0]> = V extends ReadonlyArray<Record<K, infer U>> ? U : never;

function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export default defineComponent({
  inheritAttrs: false,
  props: {
    /**
     * Items can be `IVeoPaginatedResponse` or an array of `IVeoEntity`
     */
    items: {
      type: [Object, Array] as PropType<ObjectTableItems>,
      default: () => []
    },
    /**
     * Keys of the default columns defined in the VeoObjectTable that should get shown
     */
    defaultHeaders: {
      type: Array as PropType<String[]>,
      default: () => []
    },
    additionalHeaders: {
      type: Array as PropType<ObjectTableHeader[]>,
      default: () => []
    },
    page: {
      type: Number,
      default: 1
    },
    sortBy: {
      type: [String, Array] as PropType<string | string[]>,
      default: () => ['name']
    },
    sortDesc: {
      type: [Boolean, Array] as PropType<boolean | boolean[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    showAllColumns: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:sort-desc': (_: boolean | boolean[]) => {},
    'update:sort-by': (_: string | string[]) => {},
    'update:page': (_: number) => {},
    'update:items-per-page': (_: number) => {},
    'page-change': (_: { newPage: number; sortBy: string; sortDesc: boolean }) => {},
    click: (_: any) => {}
  },
  setup(props, { emit, slots, attrs, listeners }) {
    const { d, t } = useI18n();
    const route = useRoute();
    const { $user, $api, i18n } = useContext();
    const vm = getCurrentInstance();

    const translations = useAsync(() => $api.translation.fetch(i18n.locales as any), 'translations');

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);
    /**
     * Format date via i18n
     */
    const formatDate: ObjectTableFormatter = (v) => {
      try {
        return d(new Date(v), 'long').replace(/,/g, '');
      } catch (e) {
        return '';
      }
    };
    /**
     * Render translated status
     */
    const renderStatus: ObjectTableRenderer = ({ item }) => {
      if (!domainId.value) return '';
      const domainDetails = item.domains[domainId.value];
      const key = `${item.type}_${domainDetails?.subType}_status_${domainDetails?.status}`;
      return translations.value?.lang?.[i18n.locale]?.[key] || item.domains[domainId.value]?.status || '';
    };
    /**
     * Distinguish between {@link IVeoPaginatedResponse} and {@link IVeoEntity}[]
     */
    const isPaginatedResponse = (v: ObjectTableItems): v is IVeoPaginatedResponse<IVeoEntity[]> => 'items' in v;
    /**
     * Render folder or file icons
     */
    const renderIcon: ObjectTableRenderer = ({ item }) =>
      h(VeoObjectIcon, {
        props: {
          objectType: item.type,
          isComposite: !!item.parts?.length
        }
      });
    /**
     * Render date column using date formatter
     */
    const renderDate: ObjectTableRenderer = ({ item }) => formatDate(item.updatedAt);
    /**
     * Render created at / updated at tooltip
     */
    const renderUpdatedAtTooltip: ObjectTableRenderer = ({ item }) => {
      return h('table', [
        item.createdAt
          ? h('tr', [
              h('td', [t('createdAt').toString(), ': ']),
              h('td', [h('strong', formatDate(item.createdAt) || '???'), ' ', t('by').toString(), ' ', h('strong', item.createdBy)])
            ])
          : [],
        item.updatedAt
          ? h('tr', [
              h('td', [t('updatedAt').toString(), ': ']),
              h('td', [h('strong', formatDate(item.updatedAt) || '???'), ' ', t('by').toString(), ' ', h('strong', item.updatedBy)])
            ])
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
          on: {
            click(e: Event) {
              // do not emit row:click events for actions
              e.stopImmediatePropagation();
            }
          }
        },
        slots.actions?.(context)
      );

    /**
     * Headers that are used by multiple tables, thus it makes sense to define them in one place
     */
    const defaultHeaders: { [key: string]: ObjectTableHeader } = {
      icon: {
        value: 'icon',
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
        sortable: true,
        width: 110,
        priority: 90,
        order: 20
      },
      abbreviation: {
        value: 'abbreviation',
        sortable: true,
        truncate: true,
        width: 80,
        priority: 60,
        order: 30
      },
      name: {
        value: 'name',
        cellClass: ['font-weight-bold'],
        width: 300,
        truncate: true,
        sortable: true,
        priority: 100,
        order: 40
      },
      status: {
        value: 'status',
        sortable: false,
        width: 110,
        render: renderStatus,
        priority: 40,
        order: 50
      },
      description: {
        value: 'description',
        sortable: false,
        width: 500,
        truncate: true,
        tooltip: ({ item }) => item.description || '',
        priority: 30,
        order: 60
      },
      updatedBy: {
        value: 'updatedBy',
        sortable: true,
        truncate: true,
        width: 80,
        priority: 50,
        order: 70
      },
      updatedAt: {
        value: 'updatedAt',
        sortable: true,
        width: 100,
        tooltip: renderUpdatedAtTooltip,
        render: renderDate,
        priority: 80,
        order: 80
      },
      actions: {
        value: 'actions',
        text: '',
        sortable: false,
        width: 80,
        render: renderActions,
        priority: 100,
        order: 90
      }
    };
    type Header = DataTableHeader & ObjectTableHeader;

    /**
     * Default header classes
     */
    const defaultClasses: string[] = [];
    /**
     * Default cell classes
     */
    const defaultCellClasses = ['flex-nowrap', 'text-no-wrap', 'cursor-pointer'];
    /**
     * Classes to apply when truncate is set
     */
    const truncateClasses = ['text-truncate', 'max-width-zero'];

    /**
     * Render value inside a cell
     */
    const renderValue = (item: IVeoEntity, key: keyof IVeoEntity | string) => (hasOwnProperty(item, key) ? String(item[key]) : '');
    /**
     * Convert ObjectTableRenderer to VNode array
     */
    const toNodeChildren = (items: ReturnType<ObjectTableRenderer>): VNodeChildren => ([] as (VNode | string)[]).concat(items);
    /**
     * Render a tooltip for a cell
     */
    const renderTooltip = (header: ObjectTableHeader, data?: VNodeData): ObjectTableRenderer => {
      return (props) => {
        const children = header.render ? toNodeChildren(header.render(props)) : renderValue(props.item, header.value);
        return h(VTooltip, {
          props: {
            bottom: true,
            maxWidth: 600
          },
          scopedSlots: {
            activator: ({ attrs, on }) => h('span', { attrs, on, ...data }, children),
            default: () => header.tooltip?.(props)
          }
        });
      };
    };
    /**
     * Prepare headers for v-data-table, applying classes and tooltip renderers
     */
    const _headers: ComputedRef<Header[]> = computed(() =>
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
            text: header.text ?? t(`objectlist.${header.value}`).toString(),
            cellClass,
            class: defaultClasses.concat(header.class || [], header.truncate ? truncateClasses : []),
            render: header.tooltip ? renderTooltip(header, { class: cellClass }) : header.render
          };
        })
        .sort((a, b) => a.order - b.order)
    );

    // Apply formatters to items:
    const mappers = _headers.value.filter((_) => !!_.map);
    const mapItem = (item: IVeoEntity) => {
      const mappedValues = Object.fromEntries(
        mappers.map((formatter) => {
          const name = formatter.value as keyof IVeoEntity;
          const value = formatter.map!(item[name]);
          return [name, value];
        })
      );
      return { ...item, ...mappedValues };
    };

    const items = computed(() => {
      const items = isPaginatedResponse(props.items) ? props.items.items : props.items;
      return items.map(mapItem);
    });
    /**
     * Create scopedSlots to apply renderers
     */
    const scopedSlots = computed(() => Object.fromEntries(_headers.value.filter((_) => !!_.render).map((_) => [`item.${_.value}`, _.render!])));
    /**
     * Calculate pagination properties
     */
    const paginationProps = computed(() => {
      if (!isPaginatedResponse(props.items)) return;
      return {
        page: props.items.page,
        serverItemsLength: props.items.totalItemCount
      };
    });

    const itemsPerPage = computed(() => $user.tablePageSize);
    const firstOrValue = <T extends unknown>(v: T | T[]): T => (Array.isArray(v) ? v[0] : v);
    const pageUpdate = {
      newPage: props.page,
      sortBy: firstOrValue(props.sortBy),
      sortDesc: firstOrValue(props.sortDesc)
    };
    const { throttle } = useThrottleNextTick();
    const emitPageUpdate = ({ newPage, sortBy, sortDesc }: { newPage?: number; sortBy?: string | string[]; sortDesc?: boolean | boolean[] }) => {
      // Update data (and keep current values)
      const data = Object.assign(pageUpdate, {
        newPage: newPage ?? props.page,
        sortBy: firstOrValue(sortBy ?? props.sortBy),
        sortDesc: firstOrValue(sortDesc ?? props.sortDesc)
      });
      // ... but only emit once at nextTick
      return throttle(() => emit('page-change', data));
    };

    /**
     * Calculate which columns should be shown based on overflow
     */
    // The headers actually displayed. This changes based on space available (resizeObserver).
    const displayedHeaders = ref<Header[]>(_headers.value);

    const calculateTableWidth = (headers: Header[]) =>
      headers.reduce((previousValue, currentValue) => {
        // The 32 is the left and right padding of each cell
        previousValue += Number(currentValue.width || 0) + 32;
        return previousValue;
      }, 0);

    const indexOfHeaderWithLowestPriority = (headers: Header[]) => {
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
      if (tableWrapper) {
        const tableWrapperWidth = tableWrapper.getBoundingClientRect().width;

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

    let tableWrapper: Element | null = null;
    onMounted(() => {
      // ToDo: Refs in render functions currently don't work, so we have to use the query selector
      tableWrapper = document.querySelector(`#veo-object-table-${vm?.uid} .v-data-table__wrapper`);
      if (tableWrapper) {
        resizeObserver.observe(tableWrapper);
      }
    });

    onUnmounted(() => {
      if (tableWrapper) {
        resizeObserver.unobserve(tableWrapper);
      }
    });

    return () =>
      h(VDataTable, {
        attrs: {
          id: `veo-object-table-${vm?.uid}`,
          ...attrs
        },
        props: {
          items: items.value,
          headers: displayedHeaders.value,
          sortBy: props.sortBy,
          sortDesc: props.sortDesc,
          page: props.page,
          loading: props.loading,
          itemsPerPage: itemsPerPage.value,
          footerProps: {
            itemsPerPageOptions: [10, 20, 50, -1]
          },
          ...paginationProps.value
        },
        on: {
          ...listeners,
          'update:page'(page: number) {
            emit('update:page', page);
            emitPageUpdate({ newPage: page });
          },
          'update:items-per-page'(itemsPerPage: number) {
            $user.tablePageSize = itemsPerPage;
            emit('update:items-per-page', itemsPerPage);
            emitPageUpdate({});
          },
          'update:sort-by'(sortBy: string | string[]) {
            emit('update:sort-by', sortBy);
            emitPageUpdate({ sortBy });
          },
          'update:sort-desc'(sortDesc: boolean | boolean[]) {
            emit('update:sort-desc', sortDesc);
            emitPageUpdate({ sortDesc });
          },
          'click:row'(_item: any, context: any) {
            if (Object.prototype.hasOwnProperty.call(attrs, 'show-select')) {
              context.select(!context.isSelected);
            }
            emit('click', context);
          }
        },
        scopedSlots: { ...scopedSlots.value, ...slots }
      });
  }
});
</script>
<style lang="scss" scoped>
::v-deep {
  .max-width-zero {
    max-width: 0;
  }

  .cursor-pointer {
    cursor: pointer;
  }
}
</style>
<i18n>
{
  "en": {
    "by": "by",
    "createdAt": "Created",
    "updatedAt": "Updated"
  },
  "de": {
    "by": "von",
    "createdAt": "Erstellt",
    "updatedAt": "Aktualisiert"
  }
}
</i18n>