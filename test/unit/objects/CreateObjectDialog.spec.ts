/*
 * verinice.veo web
 * Copyright (C) 2021  Annemarie Bufe, Jonas Heitmann
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
import VueI18n from 'vue-i18n';
import { merge } from 'lodash';

import VeoCreateObjectDialog from '~/components/objects/VeoCreateObjectDialog.vue';
import VeoDialog from '~/components/layout/VeoDialog.vue';
import VeoObjectForm from '~/components/objects/VeoObjectForm.vue';
import VeoObjectFormSkeleton from '~/components/objects/VeoObjectFormSkeleton.vue';
import VeoPage from '~/components/layout/VeoPage.vue';
import VeoPageHeader from '~/components/layout/VeoPageHeader.vue';
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue';
import VeoTabs from '~/components/layout/VeoTabs.vue';
import VeoForm from '~/components/forms/VeoForm.vue';
import { prefixCyData } from '~/plugins/utils';

import process from '~/cypress/fixtures/api/default/schemas/process.json';

Vue.use(Vuetify);
Vue.use(VueI18n);

const i18n = new VueI18n();
const vuetify = new Vuetify();

const mockDefaults = {
  vuetify,
  i18n,
  components: {
    VeoDialog: () => {
      merge(VeoDialog, {
        components: {
          VeoObjectForm: () =>
            merge(VeoObjectForm, {
              components: {
                VeoObjectFormSkeleton,
                VeoPage: () =>
                  merge(VeoPage, {
                    components: {
                      VeoPageHeader
                    }
                  }),
                VeoPageWrapper,
                VeoTabs,
                VeoForm
              }
            })
        }
      });
    },
    VeoObjectForm: () =>
      merge(VeoObjectForm, {
        components: {
          VeoObjectFormSkeleton,
          VeoPage: () =>
            merge(VeoPage, {
              components: {
                VeoPageHeader
              }
            }),
          VeoPageWrapper,
          VeoTabs,
          VeoForm
        }
      })
  },
  mocks: {
    $nuxt: {
      context: {
        $api: {
          schema: {
            fetch: (_objectType: string, _domainId: string[]) => {
              return process;
            }
          }
        },
        $config: {
          apiUrl: 'some-url'
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
    },
    $route: {
      params: {
        unit: 'my-completely-invalid-uuid-that-doesnt-matter'
      }
    }
  }
} as any;

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
  it('should open veo filter dialog, select a filter, close dialog and reopen dialog. All filters should be reset', async () => {
    document.body.setAttribute('data-app', 'true'); // Needed to avoid vuetify throwing a warning about not finding the app

    const wrapper = mount(VeoCreateObjectDialog, {
      ...mockDefaults,
      propsData: {
        value: true,
        objectType: 'process',
        domainId: 'my-unused-uuid-that-doesnt-fit-the-schema'
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const el = wrapper.findComponent(VeoObjectForm);
    console.log(el);
    // const createObjectDialog = wrapper.getComponent(VeoDialog);
    // console.log(createObjectDialog.html());

    /* createObjectDialog.find('[name=name]').setValue('Mein Objektname');
    expect((wrapper.getComponent(VeoCreateObjectDialog) as any).vm.objectData).toEqual({
      name: 'Mein Objektname'
    });
    createObjectDialog.find('.close-button').vm.$emit('click'); // v-btn is NOT native, thus we can't use trigger(click)
    await new Promise((resolve) => setTimeout(resolve, 200)); // Waiting for 200ms, as the filter only gets reset after the close animation (150ms)
    expect((wrapper.getComponent(VeoCreateObjectDialog) as any).vm.objectData).toEqual({}); */
  });
});
