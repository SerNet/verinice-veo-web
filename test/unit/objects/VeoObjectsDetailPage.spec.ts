/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
/*
 * verinice.veo web
 * Copyright (C) 2021  Annemarie Bufe, Jonas Heitmann
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

import { install as VeeValidate } from '~/plugins/vee-validate';
import VeoObjectsDetailPage from '~/pages/_unit/domains/_domain/objects/_id.vue';

import process from '~/cypress/fixtures/api/default/schemas/process.2019.json';
import forms from '~/cypress/fixtures/api/forms/fetchAll.json';
import form from '~/cypress/fixtures/api/forms/3ebd14a2-eb7d-4d18-a9ad-2056da85569e.json';
import translation from '~/cypress/fixtures/translations/translation.json';

Vue.use(VeeValidate);

const vuetify = new Vuetify();

const mockDefaults = {
  vuetify,
  mocks: {
    $nuxt: {
      context: {
        $api: {
          schema: {
            fetch: (_objectType: string, _domainId: string[]) => {
              return process;
            }
          },
          form: {
            fetchAll: (_domain?: string) => {
              return forms;
            },
            fetch: (_id: string) => {
              return form;
            }
          },
          translation: {
            fetch: (_langs: any) => {
              return {
                lang: translation
              };
            }
          }
        },
        $config: {
          apiUrl: 'some-url'
        }
      }
    }, // Needed if useFetch() gets used in composition api
    $route: {
      params: {
        unit: 'my-completely-invalid-unit-uuid-that-doesnt-matter'
      }
    }
  }
} as any;

describe('CreateObjectDialog.vue', () => {
  it('should render', () => {
    const component = mount(VeoObjectsDetailPage, {
      ...mockDefaults,
      propsData: {}
    });
    expect(component).toBeTruthy();
  });

  it('Should enter something in the form and reset it. The data should equal the original data', () => {
    console.log('asdf');
  });
});
