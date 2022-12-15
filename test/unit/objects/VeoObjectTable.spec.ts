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
import Vue from 'vue';
import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';

import { VDataTable, VSelect } from 'vuetify/lib';
import VeoObjectTable from '~/components/objects/VeoObjectTable.vue';
import { IVeoPaginatedResponse } from '~/types/VeoTypes';

Vue.use(Vuetify);

describe.skip('VeoObjectTable.vue', () => {
  const vuetify = new Vuetify();
  const mockDefaults = {
    vuetify,
    mocks: {
      $nuxt: {
        context: {
          app: {
            i18n: {
              t: (v: string) => v,
              locale: 'de'
            }
          },
          i18n: {
            locales: [
              { code: 'de', file: 'de.ts', name: 'Deutsch' },
              { code: 'en', file: 'en.ts', name: 'English' }
            ]
          },
          $api: {
            translation: {
              fetch() {
                return Promise.resolve([]);
              }
            }
          },
          $config: {
            debugCache: false
          }
        }
      },
      $route: {
        params: {
          domain: undefined
        }
      }
    }
  };

  it('should render', () => {
    const component = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {}
    });
    expect(component).toBeTruthy();
  });

  it('should render a VDataTable', () => {
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {}
    });
    const table = wrapper.findComponent(VDataTable);
    expect(table.exists()).toBeTruthy();
  });

  it('should support IVeoPaginatedResponse', async () => {
    const items: IVeoPaginatedResponse<any[]> = { items: new Array(5).fill({}), totalItemCount: 5, page: 1, pageCount: 1 };
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items,
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']
      }
    });
    const table = wrapper.findComponent(VDataTable);
    await wrapper.vm.$nextTick();
    const rows = table.findAll('tbody > tr');
    expect(rows).toHaveLength(5);
  });

  it('should support array of items', async () => {
    const items: any[] = new Array(5).fill({});
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items,
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']
      }
    });
    const table = wrapper.findComponent(VDataTable);
    await wrapper.vm.$nextTick();
    const rows = table.findAll('tbody > tr');
    expect(rows).toHaveLength(5);
  });

  it('navigates the forms table using the forward/back buttons', async () => {
    const data: IVeoPaginatedResponse<any[]> = { items: new Array(10), pageCount: 2, page: 1, totalItemCount: 20 };
    const onUpdatePage = jest.fn<any, [number]>();
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items: data,
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']
      },
      listeners: {
        'update:page': onUpdatePage
      }
    });
    const table = wrapper.findComponent(VDataTable);
    const nextBtn = table.find('.v-data-footer__icons-after .mdi-chevron-right');
    await nextBtn.trigger('click');
    expect(onUpdatePage).toBeCalledWith(2); // next page
    const prevBtn = table.find('.v-data-footer__icons-before .mdi-chevron-left');
    await prevBtn.trigger('click');
    expect(onUpdatePage).toBeCalledWith(1); // prev page
  });

  it('changes page size of the table', async () => {
    // Vuetify does not expose typing yet
    interface VSelectImpl extends Vue {
      selectItem(value: number): Promise<void>;
    }

    const data: IVeoPaginatedResponse<any[]> = { items: new Array(10), pageCount: 2, page: 1, totalItemCount: 20 };
    const onUpdateItemsPerPage = jest.fn<any, [number]>();
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items: data,
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']
      },
      listeners: {
        'update:items-per-page': onUpdateItemsPerPage
      }
    });
    const table = wrapper.findComponent(VDataTable);
    // items per page select inside VDataTable
    const perPageSelect = table.find('.v-data-footer .v-input').findComponent<VSelectImpl>(VSelect);
    await perPageSelect.vm.selectItem(15);
    expect(onUpdateItemsPerPage).toBeCalledWith(15);
    // "reset" items per page in order to not influence following unit tests
    await perPageSelect.vm.selectItem(20);
    expect(onUpdateItemsPerPage).toBeCalledWith(20);
  });

  it('tests sorting for every sortable column', async () => {
    const data: IVeoPaginatedResponse<any[]> = { items: new Array(10), pageCount: 2, page: 1, totalItemCount: 20 };
    const onPageChange = jest.fn<any, [number]>();
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items: data,
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']
      },
      listeners: {
        'page-change': onPageChange
      }
    });
    const table = wrapper.findComponent(VDataTable);
    const headers = table.findAll('th[role=columnheader]');
    const headerByName = new Map(headers.wrappers.map((_) => [_.text(), _]));
    // Array containing the property that should be sorted for:
    const sortableColumns = ['designator', 'name', 'updatedAt', 'updatedBy'];
    for (const column of sortableColumns) {
      const header = headerByName.get(`objectlist.${column}`);
      expect(header).toBeTruthy();
      await header?.trigger('click');
      expect(onPageChange).toHaveBeenCalled();
      // the latest call should include sortBy clicked column
      expect(onPageChange.mock.calls.pop()?.[0]).toMatchObject({ sortBy: column });
    }
  });

  it('emits click event for select entry', async () => {
    const data = [{ name: 'Eintrag 1' }, { name: 'Eintrag 2' }, { name: 'Eintrag 3' }];
    const onItemClick = jest.fn<any, [{ item: typeof data[0] }]>();
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items: data,
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']
      },
      listeners: {
        click: onItemClick
      }
    });
    const table = wrapper.findComponent(VDataTable);
    // Select second item
    const row = table.find('tbody > tr:nth-child(2)');
    await row.trigger('click');
    expect(onItemClick).toBeCalledTimes(1);
    const [[{ item: firstCallItem }]] = onItemClick.mock.calls;
    expect(firstCallItem).toMatchObject(data[1]);
  });

  it('supports pagination for array of items', () => {
    const data = new Array(50).fill(undefined).map((_, index) => ({
      // Generate sample data with leading zeros to avoid special sorting
      name: `Eintrag ${index.toString().padStart(2, '0')}`
    }));
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items: data,
        page: 2, // simulate page 2
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']
      }
    });
    const table = wrapper.findComponent(VDataTable);
    const row = table.findAll('tbody > tr');
    const currentPageView = row.wrappers.map((_) => _.text());
    // expect to display entries 21 - 40
    expect(currentPageView).toMatchObject(data.map((_) => _.name).slice(20, 40));
    // check wether pages are rendered correctly
    expect(table.find('.v-data-footer__pagination').text()).toBe('21-40 of 50');
  });

  it('sorts array of items correctly', () => {
    const data = new Array(50).fill(undefined).map((_, index) => ({
      // Use sinus to create a predictable order that is not linearly ascending
      designator: 'ENTRY-' + Math.round(Math.sin(10000 + index) * 1000),
      // Generate sample data with leading zeros to avoid special sorting
      name: `>>Eintrag ${index.toString().padStart(2, '0')}<<`
    }));
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items: data,
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt'],
        sortBy: 'designator'
      }
    });
    const table = wrapper.findComponent(VDataTable);
    const row = table.findAll('tbody > tr');
    // Extract name column
    const currentPageView = row.wrappers.map((_) =>
      _.text()
        .match(/>>.*<</g)
        ?.pop()
    );
    // sort by designator and extract first 20 entries
    const sortedPageView = data
      .sort((a, b) => a.designator.localeCompare(b.designator))
      .map((_) => _.name)
      .slice(0, 20);
    // entries should be sorted by designator
    expect(currentPageView).toMatchObject(sortedPageView);
  });

  it('should display expected headers', () => {
    const data = new Array(50).fill(undefined);
    const wrapper = mount(VeoObjectTable, {
      ...mockDefaults,
      propsData: {
        items: data,
        defaultHeaders: ['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']
      }
    });
    const table = wrapper.findComponent(VDataTable);
    const columns = table
      .findAll('th[role=columnheader]')
      .wrappers.map((_) => _.text())
      .filter((_) => _.startsWith('objectlist.'))
      .map((_) => _.split('.').pop());

    expect(columns).toMatchObject(['designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt']);
  });
});
