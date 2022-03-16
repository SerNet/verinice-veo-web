<!--
   - verinice.veo web
   - Copyright (C) 2021 Markus Werner
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
import { computed, defineComponent, PropType, h, useContext, useAsync } from '@nuxtjs/composition-api';
import { VNode, VNodeChildren, VNodeData } from 'vue/types/vnode';
import { useI18n } from 'nuxt-i18n-composable';
import { DataTableHeader } from 'vuetify/types';
import { VDataTable, VIcon, VTooltip } from 'vuetify/lib';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { useThrottleNextTick } from '~/composables/utils';

export type ObjectTableItems = IVeoPaginatedResponse<IVeoEntity[]> | Array<IVeoEntity>;

export type ObjectTableFormatter = (value: any) => string;
export type ObjectTableTooltip = (value: any) => string;
export type ObjectTableRenderer = (props: { item: IVeoEntity }) => VNode | VNode[] | string;

export interface ObjectTableHeader extends Omit<DataTableHeader, 'text'> {
  isDense?: boolean;
  isSimple?: boolean;
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
     * Reduce number of headers
     */
    dense: {
      type: Boolean,
      default: false
    },
    /**
     * Simple table (only name)
     */
    simple: {
      type: Boolean,
      default: false
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
    const { $user, $api, i18n } = useContext();
    const translations = useAsync(() => $api.translation.fetch(i18n.locales as any), 'translations');
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
      if (!$user.lastDomain) return '';
      const domainId = $user.lastDomain;
      const domainDetails = item.domains[domainId];
      const key = `${item.type}_${domainDetails?.subType}_status_${domainDetails?.status}`;
      return translations.value?.lang?.[i18n.locale]?.[key] || (item.domains[domainId] ? item.domains[domainId]?.status : '');
    };
    /**
     * Distinguish between {@link IVeoPaginatedResponse} and {@link IVeoEntity}[]
     */
    const isPaginatedResponse = (v: ObjectTableItems): v is IVeoPaginatedResponse<IVeoEntity[]> => 'items' in v;
    /**
     * Render folder or file icons
     */
    const renderIcon: ObjectTableRenderer = ({ item }) => {
      if (item.type !== 'scope' && item.parts?.length) return h(VIcon, 'mdi-file-document-multiple');
      else if (item.type === 'scope' && item.parts?.length) return h(VIcon, 'mdi-archive-arrow-down');
      else if (item.type === 'scope') return h(VIcon, 'mdi-archive');
      else if (item.type === 'scope') return h(VIcon, 'mdi-archive');
      return h(VIcon, 'mdi-file-document');
    };
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
     * Header configuration
     */
    const headerConfig: ObjectTableHeader[] = [
      {
        value: 'icon',
        isDense: false,
        isSimple: true,
        sortable: false,
        text: '',
        class: ['pr-0'],
        cellClass: ['pr-0'],
        width: 0,
        render: renderIcon
      },
      {
        value: 'designator',
        isDense: true,
        isSimple: false,
        sortable: true,
        width: 110
      },
      {
        value: 'abbreviation',
        isDense: false,
        isSimple: false,
        sortable: true,
        truncate: true,
        width: 80
      },
      {
        value: 'name',
        isDense: true,
        isSimple: true,
        cellClass: ['font-weight-bold'],
        width: 300,
        truncate: true,
        sortable: true
      },
      {
        value: 'status',
        isDense: false,
        isSimple: false,
        sortable: false,
        width: 110,
        render: renderStatus
      },
      {
        value: 'description',
        isDense: false,
        isSimple: false,
        sortable: false,
        width: 500,
        truncate: true,
        tooltip: ({ item }) => item.description || ''
      },
      {
        value: 'updatedBy',
        isDense: true,
        isSimple: false,
        sortable: true,
        width: 110
      },
      {
        value: 'updatedAt',
        isDense: true,
        isSimple: false,
        sortable: true,
        width: 200,
        tooltip: renderUpdatedAtTooltip,
        render: renderDate
      },
      {
        value: 'actions',
        isDense: true,
        isSimple: false,
        text: '',
        sortable: false,
        width: 110,
        render: renderActions
      }
    ];
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
    const _headers: Header[] = headerConfig.map((header) => {
      const cellClass = defaultCellClasses.concat(header.cellClass || [], header.truncate ? truncateClasses : []);
      return {
        ...header,
        isDense: !!header?.isDense,
        isSimple: !!header?.isSimple,
        text: header.text ?? t(`objectlist.${header.value}`).toString(),
        cellClass,
        class: defaultClasses.concat(header.class || [], header.truncate ? truncateClasses : []),
        render: header.tooltip ? renderTooltip(header, { class: cellClass }) : header.render
      };
    });

    // Apply formatters to items:
    const mappers = _headers.filter((_) => !!_.map);
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

    // headers (less in dense mode)
    const denseHeaders = _headers.filter((header) => header.isDense);
    const simpleHeaders = _headers.filter((header) => header.isSimple);
    const headers = computed(() => (props.simple ? simpleHeaders : props.dense ? denseHeaders : _headers));
    const items = computed(() => {
      const items = isPaginatedResponse(props.items) ? props.items.items : props.items;
      return items.map(mapItem);
    });
    /**
     * Create scopedSlots to apply renderers
     */
    const scopedSlots = computed(() => Object.fromEntries(_headers.filter((_) => !!_.render).map((_) => [`item.${_.value}`, _.render!])));
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

    return () =>
      h(VDataTable, {
        attrs,
        props: {
          items: items.value,
          headers: headers.value,
          sortBy: props.sortBy,
          sortDesc: props.sortDesc,
          page: props.page,
          loading: props.loading,
          itemsPerPage: itemsPerPage.value,
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