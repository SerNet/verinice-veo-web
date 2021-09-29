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

import { install as VeeValidate } from '@/plugins/vee-validate';
import VeoForm from '~/components/forms/VeoForm.vue';
import { Renderable } from '~/types/renderable';

Vue.use(VeeValidate);
Vue.use(Vuetify);
const vuetify = new Vuetify();

describe('InputUri.vue', () => {
  it('should be rendered InputUri field', () => {
    const form: Renderable = {
      schema: {
        type: 'object',
        properties: {
          inputUri: {
            type: 'string',
            format: 'uri',
            pattern: '^(https?|ftp)://'
          }
        }
      },
      ui: {
        type: 'Control',
        scope: '#/properties/inputUri',
        options: {
          label: 'Input URI'
        }
      },
      value: {
        inputUri: 'https://verinice.com/'
      }
    };
    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form }
    });
    // Usage of Snapshots with Vue: https://www.digitalocean.com/community/tutorials/vuejs-jest-snapshot-testing-in-vue
    expect(wrapper.element).toMatchSnapshot('Initial render');
  });
});
