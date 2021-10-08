/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Markus Werner
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

import VeoForm from '~/components/forms/VeoForm.vue';
import { Renderable } from '~/types/renderable';

import { install as VeeValidate } from '~/plugins/vee-validate';
Vue.use(VeeValidate);
Vue.use(Vuetify);
const vuetify = new Vuetify();

describe('VeoForm.vue', () => {
  it("should render second text field if first contains text 'hans'", async () => {
    const form: Renderable = {
      schema: {
        properties: {
          name: {
            type: 'string'
          },
          age: {
            type: 'number'
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

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form }
    });

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs.at(0).element.tagName).toBe('INPUT');

    inputs.at(0).setValue('hans');

    await wrapper.vm.$forceUpdate();

    const inputsAfter = wrapper.findAll('input');
    expect(inputsAfter.length).toBe(1);
  });
});
