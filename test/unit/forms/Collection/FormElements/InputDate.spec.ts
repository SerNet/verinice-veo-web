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
import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import flushPromises from 'flush-promises';

import VeoForm from '~/components/forms/VeoForm.vue';

const vuetify = new Vuetify();

describe('InputDate.vue', () => {
  it('should render input-date element for dates', async () => {
    const form = {
      objectSchema: {
        type: 'object',
        properties: {
          dueDate: {
            type: 'string',
            format: 'date'
          }
        }
      },
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Control',
            scope: '#/properties/dueDate',
            options: {
              label: 'Due Date'
            }
          }
        ]
      },
      value: {
        dueDate: '2019-08-13'
      }
    };

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form },
      mocks: {
        $t: (msg: any) => msg
      }
    });

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick();

    const controlElement = wrapper.find('.vf-wrapper > .vf-layout > .flex-column > .vf-form-element');

    expect(controlElement.findAll('.v-input.v-text-field')).toHaveLength(1);
    expect(controlElement.findAll('input')).toHaveLength(1);
    expect(controlElement.findAll('label')).toHaveLength(1);

    expect(controlElement.find('.v-input.v-text-field').get('input'));
    expect((controlElement.find('.v-input.v-text-field input').element as HTMLInputElement).value).toBe('2019-08-13');
    expect(controlElement.find('.v-input.v-text-field input').element.hasAttribute('type')).toBe(true);
    expect(controlElement.find('.v-input.v-text-field input').element.getAttribute('type')).toBe('text');

    wrapper.setProps({ value: { dueDate: '2019-09-20' } });
    await flushPromises();
    expect((controlElement.find('.v-input.v-text-field input').element as HTMLInputElement).value).toBe('2019-09-20');

    expect(controlElement.find('.v-input.v-text-field').get('label'));
    expect(controlElement.find('.v-input.v-text-field label').text()).toBe('Due Date');
  });
});
