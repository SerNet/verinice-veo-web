/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Markus Werner, Jonas Heitmann
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
import flushPromises from 'flush-promises';

import { install as VeeValidate } from '@/plugins/vee-validate';
import VeoForm from '~/components/forms/VeoForm.vue';
import { Renderable } from '~/types/renderable';
Vue.use(VeeValidate);
Vue.use(Vuetify);
const vuetify = new Vuetify();

describe('InputDateTime.vue', () => {
  it('should render input-date-time element for date-times', async () => {
    const form: Renderable = {
      schema: {
        properties: {
          dueDateTime: {
            type: 'string',
            format: 'date'
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
            scope: '#/properties/dueDateTime',
            options: {
              label: 'Due Date-Time'
            }
          }
        ]
      },
      value: {
        dueDateTime: '2020-08-05T12:05:00+02:00'
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

    const el = wrapper.find('.vf-wrapper > .vf-layout > .row > .col > .row > .vf-control .v-input.v-text-field input');

    expect(el.exists()).toBe(true);

    const inputElement = wrapper.find('.vf-wrapper > .vf-layout > .row > .col > .row > .vf-control .v-input.v-text-field input').element as HTMLInputElement;

    expect(wrapper.element).toMatchSnapshot('Initial render');

    expect(inputElement.value).toBe('2020-08-05T12:05:00+02:00');

    wrapper.setProps({
      value: { dueDateTime: '1999-08-05T12:05:00+02:00' }
    });
    await flushPromises();

    expect(wrapper.element).toMatchSnapshot('Updated DateTime');

    expect(inputElement.value).toBe('1999-08-05T12:05:00+02:00');
  });
});
