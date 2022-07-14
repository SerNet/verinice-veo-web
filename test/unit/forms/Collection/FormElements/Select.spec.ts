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
import { Renderable } from '~/types/renderable';

const vuetify = new Vuetify();

describe('Select.vue', () => {
  it('should render select component to choose some list element', async () => {
    const form: Renderable = {
      schema: {
        type: 'object',
        properties: {
          list: {
            type: 'string',
            enum: ['First', 'Second', 'Third', 'Fourth', 'Fifth']
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
            scope: '#/properties/list',
            options: {
              label: 'List'
            }
          }
        ]
      },
      value: {
        list: 'First'
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

    expect(controlElement.findAll('.v-input.v-select')).toHaveLength(1);
    expect(controlElement.findAll('.v-select__selection')).toHaveLength(1);
    expect(controlElement.findAll('label')).toHaveLength(1);

    expect(controlElement.find('.v-input.v-select').get('.v-select__selection'));
    expect(controlElement.find('.v-input.v-select .v-select__selection').text()).toBe('First');
    wrapper.setProps({ value: { list: 'Fourth' } });
    await flushPromises();
    expect(controlElement.find('.v-input.v-select .v-select__selection').text()).toBe('Fourth');
    expect(controlElement.find('.v-input.v-select').get('label'));
    expect(controlElement.find('.v-input.v-select label').text()).toBe('List');
    // TODO: Add more Tests for Select
    // Find a way, to test list of items for selection. Now it's not possible.
  });

  it('should render select component to choose multiple list elements', async () => {
    const form: Renderable = {
      schema: {
        type: 'object',
        properties: {
          list: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['First', 'Second', 'Third', 'Fourth', 'Fifth']
            }
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
            scope: '#/properties/list',
            options: {
              label: 'List'
            }
          }
        ]
      },
      value: {
        list: ['First', 'Second']
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

    expect(controlElement.findAll('.v-input.v-select')).toHaveLength(1);
    expect(controlElement.findAll('.v-select__selection')).toHaveLength(2);
    expect(controlElement.findAll('label')).toHaveLength(1);

    expect(controlElement.find('.v-input.v-select').get('.v-select__selection'));
    expect(controlElement.findAll('.v-input.v-select .v-select__selection').at(0).text()).toBe('First,');
    expect(controlElement.findAll('.v-input.v-select .v-select__selection').at(1).text()).toBe('Second');
    wrapper.setProps({ value: { list: ['First', 'Second', 'Third'] } });
    await flushPromises();
    expect(controlElement.findAll('.v-select__selection')).toHaveLength(3);
    expect(controlElement.findAll('.v-input.v-select .v-select__selection').at(0).text()).toBe('First,');
    expect(controlElement.findAll('.v-input.v-select .v-select__selection').at(1).text()).toBe('Second,');
    expect(controlElement.findAll('.v-input.v-select .v-select__selection').at(2).text()).toBe('Third');

    expect(controlElement.find('.v-input.v-select').get('label'));
    expect(controlElement.find('.v-input.v-select label').text()).toBe('List');
  });
});
