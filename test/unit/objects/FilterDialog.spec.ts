/*
 * verinice.veo web
 * Copyright (C) 2021  Annemarie Bufe
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
import 'regenerator-runtime/runtime';
import VueI18n from 'vue-i18n';

import VeoFilterDialog from '~/components/layout/VeoFilterDialog.vue';
import VeoDialog from '~/components/layout/VeoDialog.vue';
import { prefixCyData } from '~/plugins/utils';

Vue.use(Vuetify);
Vue.use(VueI18n);

const i18n = new VueI18n();
const vuetify = new Vuetify();

const mockDefaults = {
  vuetify,
  i18n,
  components: {
    VeoDialog
  },
  mocks: {
    $nuxt: {
      context: {
        $api: {
          schema: {
            fetchAll() {
              return Promise.resolve([
                {
                  schemaName: 'scope',
                  endpoint: 'scopes'
                }
              ]);
            }
          }
        }
      }
    }, // Needed if useFetch() gets used in composition api
    $utils: {
      /*
       * NOTE!! This function will not work as when called in the browser (either npm run dev or cypress), at it has no access to $options
       * or $route.
       * This function will thus just return the string one passed to it, however we use it in the template to enable cypress e2e tests in the future
       */
      prefixCyData
    }
  }
};

// Needed if useI18n() gets used in compoisition api
jest.mock('nuxt-i18n-composable', () => ({
  useI18n() {
    return {
      t: (t: string) => t,
      locale: 'de'
    };
  }
}));

describe('FilterDialog.vue', () => {
  it('should open veo filter dialog with 5 filters and be expandable to 10 filters', async () => {
    document.body.setAttribute('data-app', 'true'); // Needed to avoid vuetify throwing a warning about not finding the app
    const filterDialog = mount(VeoFilterDialog, {
      ...mockDefaults,
      propsData: {
        value: true,
        domain: 'my-completely-invalid-uuid-that-doesnt-matter'
      }
    });

    expect(filterDialog.find('.veodialog').isVisible()).toBe(true);
    expect(filterDialog.findAll('[data-cy=-filter-option]').wrappers.length).toBe(5);
    filterDialog.find('[data-cy=-expand-button]').trigger('click');
    await filterDialog.vm.$nextTick();
    expect(filterDialog.findAll('[data-cy=-filter-option]').wrappers.length).toBe(10);
  });

  it('Tests whether existing filters passed to the component are present in the form', async () => {
    const filter = {
      objectType: 'scope',
      subType: 'SCP_ResponsibleBody',
      designator: 'SCP-1',
      name: 'Scope 1',
      status: 'NEW',
      description: 'My description',
      updatedBy: 'user1',
      notPartOfGroup: 'true',
      hasChildObjects: 'true',
      hasLinks: 'true'
    };

    document.body.setAttribute('data-app', 'true'); // Needed to avoid vuetify throwing a warning about not finding the app
    const filterDialog = mount(VeoFilterDialog, {
      ...mockDefaults,
      propsData: {
        value: true,
        domain: 'my-completely-invalid-uuid-that-doesnt-matter',
        filter
      }
    });

    await filterDialog.vm.$nextTick();
    filterDialog.find('[data-cy=-expand-button]').trigger('click');
    await filterDialog.vm.$nextTick();

    for (let i = 0; i < Object.keys(filter).length; i++) {
      expect((filterDialog.findAll('[data-cy=-filter-option]').at(i).element.children[0] as any).__vue__.internalValue).toBe(Object.values(filter)[i]);
    }
  });

  it.only('should open veo filter dialog, select a filter and submit selected filter values and reset filter values (no preseted filters)', async () => {
    document.body.setAttribute('data-app', 'true'); // Needed to avoid vuetify throwing a warning about not finding the app

    // We use a wrapper, as vue-test-utils don't work with composition api emit
    const wrapper = Vue.extend({
      components: {
        VeoFilterDialog,
        VeoDialog
      },
      data() {
        return {
          filter: undefined,
          filterIsVisible: false
        };
      },
      render(h) {
        return h('div', [
          h(
            { ...VeoFilterDialog, components: { VeoDialog } },
            {
              props: {
                value: true,
                domain: 'my-completely-invalid-uuid-that-doesnt-matter',
                filter: this.$data.filter
              },
              on: {
                'update:filter': (bla: any) => {
                  console.log('Asdf111111111111111111111111111111111111111111111111111111111111111111111111111111111111111', bla);
                }
              }
            }
          )
        ]);
      }
    });

    const app = mount(wrapper, {
      ...mockDefaults
    });
    const filterDialog = app.find('.v-dialog');

    filterDialog.find('[name=designator]').setValue('Designator Text');
    filterDialog.find('[name=name]').setValue('Name');
    filterDialog.find('.submit-btn').trigger('click');

    await app.vm.$nextTick();

    /* expect(submitEvent).toEqual({
      designator: 'Designator Text',
      name: 'Name'
    }); */

    /* filterDialog.find('.reset-btn').trigger('click');

    const resetEvents = filterDialog.emitted()['updated:filter'];
    const [resetEvent] = JSON.parse(JSON.stringify(resetEvents?.pop() || []));

    expect(resetEvent).toEqual({}); */
  });
});
