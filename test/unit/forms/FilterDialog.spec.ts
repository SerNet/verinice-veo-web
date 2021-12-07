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

import { mount, config, createLocalVue, shallowMount } from '@vue/test-utils';

import Vuetify from 'vuetify';
import 'regenerator-runtime/runtime';
import VueI18n from 'vue-i18n';

import VeoFilterDialog from '~/components/layout/VeoFilterDialog.vue';
import VeoDialog from '~/components/layout/VeoDialog.vue';
import { Renderable } from '~/types/renderable';

import { install as VeeValidate } from '~/plugins/vee-validate';
Vue.use(VeeValidate);
Vue.use(Vuetify);
Vue.use(VueI18n);

const i18n = new VueI18n();
const vuetify = new Vuetify();

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
  it('should open veo filter dialog', /* async */ () => {
    /* const dialog = mount(VeoDialog, {
      vuetify,
      propsData: { headline: 'headline' }
      mocks: {
        $t: () => 'some specific text'
      }
    }); */
    const filterDialog = shallowMount(VeoFilterDialog, {
      vuetify,
      i18n,
      components: {
        VeoDialog
      },
      mocks: {
        $nuxt: {} // Needed if useFetch() gets used in composition api
      }
    });

    /*     config.mocks = {
      $t: (text: any) => text
    }; */
    /*     const i18n = new VueI18n({
      locale: 'de',
      fallbackLocale: 'de'
    }); */
    /*     const dialog: Renderable = {
      schema: {
        properties: {
          headline: {
            type: 'string'
          },
          objectType: {
            type: 'string'
          },
          subType: {
            type: 'string'
          }
        }
      },
      ui: {
        type: 'Layout',
        options: {
          direction: 'horizontal',
          format: 'group'
        },
        elements: [
          {
            type: 'Control',
            label: 'Name',
            scope: '#/properties/name'
          },
          {
            type: 'Control',
            label: 'Age',
            scope: '#/properties/age',
            rule: {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/name',
                schema: { const: 'hans' }
              }
            }
          }
        ]
      },
      value: { headline: 'test' }
    };

    const veoDialog = mount(VeoDialog, { vuetify, propsData: { headline: 'tst' } });

    const wrapper = mount(VeoFilterDialog, {
      vuetify,
      i18n,
      propsData: { ...dialog }
    }); */
    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    /*     wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick(); */
    /* 
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs.at(0).element.tagName).toBe('INPUT');

    inputs.at(0).setValue('hans');

    await wrapper.vm.$forceUpdate();

    const inputsAfter = wrapper.findAll('input');
    expect(inputsAfter.length).toBe(1); */
  });
});
