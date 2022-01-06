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

import { install as VeeValidate } from '@/plugins/vee-validate';
import VeoForm from '~/components/forms/VeoForm.vue';
import { Renderable } from '~/types/renderable';

Vue.use(VeeValidate);

const vuetify = new Vuetify();

describe('InputNumber.vue', () => {
  it('should render input-text-field element for numbers', async () => {
    const form: Renderable = {
      schema: {
        type: 'object',
        properties: {
          age: {
            type: 'number'
          }
        }
      },
      ui: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Control',
            label: 'Age',
            scope: '#/properties/age',
            options: {
              label: 'Age'
            }
          }
        ]
      },
      value: {
        age: 18
      }
    };

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form }
    });

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick();

    const controlElement = wrapper.find('.vf-wrapper > .vf-layout > .row > .col > .row > .vf-control');

    expect(controlElement.findAll('.v-input.v-text-field')).toHaveLength(1);
    expect(controlElement.findAll('input')).toHaveLength(1);
    expect(controlElement.findAll('label')).toHaveLength(1);

    expect(controlElement.find('.v-input.v-text-field').get('input'));
    expect((controlElement.find('.v-input.v-text-field input').element as HTMLInputElement).value).toBe('18');
    expect(controlElement.find('.v-input.v-text-field input').element.hasAttribute('type')).toBe(true);
    expect(controlElement.find('.v-input.v-text-field input').element.getAttribute('type')).toBe('number');
    expect(controlElement.find('.v-input.v-text-field').get('label'));
    expect(controlElement.find('.v-input.v-text-field label').text()).toBe('Age');
  });
});
