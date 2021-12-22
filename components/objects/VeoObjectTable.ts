/*
 * verinice.veo web
 * Copyright (C) 2021  Markus Werner
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { computed, defineComponent, PropType, h, useContext, watch, useAsync } from '@nuxtjs/composition-api';
import { VNode, VNodeChildren, VNodeData } from 'vue/types/vnode';
import { useI18n } from 'nuxt-i18n-composable';
import { DataTableHeader } from 'vuetify/types';
import { VDataTable, VIcon, VTooltip } from 'vuetify/lib';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

export type ObjectTableItems = IVeoPaginatedResponse<IVeoEntity[]> | Array<IVeoEntity>;

export type ObjectTableFormatter = (value: any) => string;
export type ObjectTableTooltip = (value: any) => string;
export type ObjectTableRenderer = (props: { item: IVeoEntity }) => VNode | VNode[] | string;

export interface ObjectTableHeader extends Omit<DataTableHeader, 'text'> {
  inDense?: boolean;
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
    'update:sort-desc': () => {},
    'update:sort-by': () => {},
    'update:page': () => {},
    'update:items-per-page': () => {}
  },
  setup(props, { emit, slots }) {
    const { d, t } = useI18n();
    const { $user, $api, i18n } = useContext();
    const translations = useAsync(() => $api.translation.fetch(i18n.locales as any), 'translations');
    // Headers:
    const formatDate: ObjectTableFormatter = (v) => {
      try {
        return d(new Date(v), 'long').replace(/,/g, '');
      } catch (e) {
        return '';
      }
    };
    const renderStatus: ObjectTableRenderer = ({ item }) => {
      if (!$user.lastDomain) return '';
      const domainId = $user.lastDomain;
      const domainDetails = item.domains[domainId];
      const key = `${item.type}_${domainDetails.subType}_status_${domainDetails.status}`;
      return translations.value?.lang?.[i18n.locale]?.[key] || (item.domains[domainId] ? item.domains[domainId].status : '');
    };
    const isPaginatedResponse = (v: ObjectTableItems): v is IVeoPaginatedResponse<IVeoEntity[]> => 'items' in v;

    const renderIcon: ObjectTableRenderer = ({ item }) => {
      if (item.type !== 'scope' && item.parts?.length) return h(VIcon, 'mdi-file-document-multiple');
      else if (item.type === 'scope' && item.parts?.length) return h(VIcon, 'mdi-archive-arrow-down');
      else if (item.type === 'scope') return h(VIcon, 'mdi-archive');
      else if (item.type === 'scope') return h(VIcon, 'mdi-archive');
      return h(VIcon, 'mdi-file-document');
    };

    const renderDate: ObjectTableRenderer = ({ item }) => formatDate(item.updatedAt);

    const renderUpdatedAtTooltip: ObjectTableRenderer = ({ item }) => {
      return h('table', [
        item.createdAt
          ? h('tr', [
              h('td', [t('objectlist.createdAt').toString(), ': ']),
              h('td', [h('strong', formatDate(item.createdAt) || '???'), ' ', t('by').toString(), ' ', h('strong', item.createdBy)])
            ])
          : [],
        item.updatedAt
          ? h('tr', [
              h('td', [t('objectlist.updatedAt').toString(), ': ']),
              h('td', [h('strong', formatDate(item.updatedAt) || '???'), ' ', t('by').toString(), ' ', h('strong', item.updatedBy)])
            ])
          : []
      ]);
    };

    const headerConfig: ObjectTableHeader[] = [
      { value: 'icon', inDense: false, text: '', class: ['pr-0'], cellClass: ['pr-0'], width: 0, render: renderIcon },
      { value: 'designator', inDense: true, sortable: true, width: 110 },
      { value: 'abbreviation', inDense: true, sortable: true, truncate: true, width: 80 },
      { value: 'name', inDense: true, cellClass: ['font-weight-bold'], sortable: true },
      { value: 'status', inDense: false, sortable: true, width: 110, render: renderStatus },
      { value: 'description', inDense: false, sortable: false, width: 300, truncate: true, tooltip: ({ item }) => item.description || '' },
      { value: 'updatedBy', inDense: true, sortable: true, width: 110 },
      { value: 'updatedAt', inDense: true, sortable: true, width: 200, tooltip: renderUpdatedAtTooltip, render: renderDate },
      { value: 'actions', inDense: true, text: '', sortable: false, width: 110 }
    ];

    const defaultClasses: string[] = [];
    const defaultCellClasses = ['flex-nowrap', 'text-no-wrap'];
    const truncateClasses = ['text-truncate', 'max-width-zero'];

    type Header = DataTableHeader & ObjectTableHeader;

    const renderValue = (item: IVeoEntity, key: keyof IVeoEntity | string) => (hasOwnProperty(item, key) ? String(item[key]) : '');
    const toNodeChildren = (items: ReturnType<ObjectTableRenderer>): VNodeChildren => (<(VNode | string)[]>[]).concat(items);
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

    const _headers: Header[] = headerConfig.map((header) => {
      const cellClass = defaultCellClasses.concat(header.cellClass || [], header.truncate ? truncateClasses : []);
      return {
        ...header,
        inDense: 'inDense' in header ? header.inDense : false,
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
    const headers = computed(() => (props.dense ? _headers.filter((header) => header.inDense) : _headers));
    const items = computed(() => {
      const items = isPaginatedResponse(props.items) ? props.items.items : props.items;
      return items.map(mapItem);
    });
    const scopedSlots = computed(() => Object.fromEntries(_headers.filter((_) => !!_.render).map((_) => [`item.${_.value}`, _.render!])));

    const paginationProps = computed(() => {
      if (!isPaginatedResponse(props.items)) return;
      return {
        page: props.items.page,
        serverItemsLength: props.items.totalItemCount
      };
    });

    const itemsPerPage = computed(() => $user.tablePageSize);
    const pageUpdate = { newPage: props.page, sortBy: props.sortBy, sortDesc: props.sortDesc };
    const emitPageUpdate = (data: Partial<typeof pageUpdate>) => {
      const update = Object.assign(pageUpdate, data);
      emit('page-change', { ...update });
    };

    return () =>
      h(VDataTable, {
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
          'update:page'(page: number) {
            emit('update:page', page);
            emitPageUpdate({ newPage: page });
          },
          'update:sort-by'(sortBy: string | string[]) {
            emit('update:sort-by', sortBy);
            emitPageUpdate({ sortBy });
          },
          'update:sort-desc'(sortDesc: boolean | boolean[]) {
            emit('update:sort-desc', sortDesc);
            emitPageUpdate({ sortDesc });
          }
        },
        scopedSlots: { ...scopedSlots.value, ...slots }
      });
  }
});
