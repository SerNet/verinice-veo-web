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

import VeoForm from '~/components/forms/VeoForm.vue';

const vuetify = new Vuetify();

describe('Layout.vue', () => {
  it('should render certain layout', async () => {
    const form = {
      objectSchema: {
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
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Layout',
            options: {
              format: 'page'
            },
            elements: [
              {
                type: 'Label',
                text: 'Page 1'
              },
              {
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
                    scope: '#/properties/age'
                  }
                ]
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              format: 'page'
            },
            elements: [
              {
                type: 'Label',
                text: 'Page 2'
              },
              {
                type: 'Label',
                text: 'It is test label'
              }
            ]
          }
        ]
      },
      value: {
        name: 'test',
        age: 99
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

    const layoutWrapper = wrapper.find('.vf-wrapper > .vf-layout');
    expect(layoutWrapper.exists()).toBe(true);
    expect(layoutWrapper.classes()).toContain('vf-group');

    expect(layoutWrapper.exists()).toBe(true);

    const horitontalLayoutSelector = wrapper.find('[id="#/elements/0/elements/1"].vf-group > .flex-row');
    expect(horitontalLayoutSelector.exists()).toBe(true);
    expect(horitontalLayoutSelector.classes()).toContain('flex-row');
  });
});
