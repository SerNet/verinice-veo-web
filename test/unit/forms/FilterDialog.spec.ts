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
import CompositionApi from '@vue/composition-api';

import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import 'regenerator-runtime/runtime';
import VueI18n from 'vue-i18n';

import VeoFilterDialog from '~/components/layout/VeoFilterDialog.vue';
import VeoDialog from '~/components/layout/VeoDialog.vue';
import { Renderable } from '~/types/renderable';

import { install as VeeValidate } from '~/plugins/vee-validate';
Vue.use(VeeValidate);
Vue.use(Vuetify);

Vue.use(CompositionApi);
const vuetify = new Vuetify();

describe('Filter Dialog.vue', () => {
  it('should render veo filter dialog', async () => {
    const dialog: Renderable = {
      schema: {
        properties: {
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
      value: { name: 'Markus', age: 29 }
    };

    const i18n = new VueI18n({
      locale: 'de',
      fallbackLocale: 'de'
    });

    const veoDialog = mount(VeoDialog, { vuetify });

    const wrapper = mount(VeoFilterDialog, {
      vuetify,
      propsData: { ...dialog },
      i18n
    });

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick();
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
