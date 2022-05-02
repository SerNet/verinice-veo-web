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

import VeoForm from '~/components/forms/VeoForm.vue';
import { Renderable } from '~/types/renderable';

import { install as VeeValidate } from '~/plugins/vee-validate';
Vue.use(VeeValidate);
Vue.use(Vuetify);
const vuetify = new Vuetify();

describe('VeoForm.vue', () => {
  it("should render second text field if first contains text 'hans'", async () => {
    const onValueUpdate = (newValue: any) => {
      form.value = newValue;
    };

    const form: Renderable = {
      schema: {
        type: 'object',
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
      propsData: form,
      listeners: {
        input: onValueUpdate
      },
      mocks: {
        $route: {
          params: {
            domain: 'my-completely-invalid-domain-uuid-that-doesnt-matter'
          }
        }
      }
    });

    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs.at(0).element.tagName).toBe('INPUT');

    inputs.at(0).setValue('hans');

    // Sadly either vue or the vue test utils won't pick up on the changes made to the value prop, so we have to manually update it.
    wrapper.setProps({ value: form.value });
    await wrapper.vm.$nextTick();

    const inputsAfter = wrapper.findAll('input');
    expect(inputsAfter.length).toBe(1);
  });
});
