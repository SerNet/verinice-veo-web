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
import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import { merge } from 'lodash';

import { install as VeeValidate } from '~/plugins/vee-validate';
import VeoCreateObjectDialog from '~/components/objects/VeoCreateObjectDialog.vue';
import VeoObjectForm from '~/components/objects/VeoObjectForm.vue';
import VeoDialog from '~/components/layout/VeoDialog.vue';
import VeoObjectFormSkeletonLoader from '~/components/objects/VeoObjectFormSkeletonLoader.vue';
import VeoFormNavigation from '~/components/layout/VeoFormNavigation.vue';
import VeoPage from '~/components/layout/VeoPage.vue';
import VeoPageHeader from '~/components/layout/VeoPageHeader.vue';
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue';
import VeoTabs from '~/components/layout/VeoTabs.vue';
import VeoForm from '~/components/forms/VeoForm.vue';
import VeoValidationResult from '~/components/util/VeoValidationResult.vue';
import VeoCard from '~/components/layout/VeoCard.vue';
import { getEmittedEvent, getFormInput, getVSelectComponentByDataCy } from '~/lib/jestUtils';

import process from '~/cypress/fixtures/api/default/schemas/process.2019.json';
import forms from '~/cypress/fixtures/api/forms/fetchAll.json';
import form from '~/cypress/fixtures/api/forms/3ebd14a2-eb7d-4d18-a9ad-2056da85569e.json';
import translation from '~/cypress/fixtures/translations/translation.json';

window.Vue.use(VeeValidate);

const vuetify = new Vuetify();

const mockDefaults = {
  vuetify,
  components: {
    VeoDialog,
    VeoObjectForm: (() =>
      merge(VeoObjectForm, {
        components: {
          VeoPageWrapper,
          VeoPage: (() => merge(VeoPage, { components: { VeoPageHeader } }))(),
          VeoForm,
          VeoFormNavigation,
          VeoValidationResult,
          VeoTabs,
          VeoObjectFormSkeletonLoader,
          VeoCard
        }
      }))()
  },
  stubs: {
    LinksFieldRow: true,
    VeoValidationResultList: true
  },
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
        },
        $vuetify: {
          breakpoint: {
            mdAndDown: false,
            smAndDown: false,
            xsOnly: false
          }
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
  it('should open create object dialog, enter a value, close the dialog and check whether the form has been reset', async () => {
    document.body.setAttribute('data-app', 'true'); // Needed to avoid vuetify throwing a warning about not finding the app

    const wrapper = mount(VeoCreateObjectDialog, {
      ...mockDefaults,
      propsData: {
        value: true,
        objectType: 'process',
        domainId: 'my-completely-invalid-domain-uuid-that-doesnt-matter'
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
    const input = getFormInput('name*');
    input.$emit('input', 'My new object name');

    expect((wrapper.vm as any).objectData).toEqual({
      owner: {
        targetUri: 'some-url/units/invalid-unit-uuid-that-doesnt-matter'
      },
      name: 'My new object name'
    });

    wrapper.find('.close-button').vm.$emit('click'); // v-btn is NOT native, thus we can't use trigger(click)
    await new Promise((resolve) => setTimeout(resolve, 200)); // Waiting for 200ms, as the filter only gets reset after the close animation (150ms)
    expect((wrapper.vm as any).objectData).toEqual({
      owner: {
        targetUri: 'some-url/units/invalid-unit-uuid-that-doesnt-matter'
      }
    });
  });

  it('should open create object dialog, enter a value, and try closing the dialog by clicking away from it and then close it by using the cancel button', async () => {
    document.body.setAttribute('data-app', 'true'); // Needed to avoid vuetify throwing a warning about not finding the app

    const wrapper = mount(VeoCreateObjectDialog, {
      ...mockDefaults,
      propsData: {
        value: true,
        objectType: 'process',
        domainId: 'my-completely-invalid-domain-uuid-that-doesnt-matter'
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
    const overlay = document.querySelector('div.v-overlay.v-overlay--active.theme--dark');
    expect(overlay).toBeTruthy();

    (overlay as any).click();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(getEmittedEvent(wrapper, 'input')).toBeFalsy();
    getEmittedEvent(wrapper, 'input');

    wrapper.setProps({
      value: true,
      objectType: 'process',
      domainId: 'my-completely-invalid-domain-uuid-that-doesnt-matter'
    });

    const input = getFormInput('name*');
    input.$emit('input', 'My new object name');

    (overlay as any).click();
    await new Promise((resolve) => setTimeout(resolve, 200));
    const emittedEvents = wrapper.emitted();
    expect(emittedEvents.input).toEqual([]);

    wrapper.find('[data-cy=-cancel-button]').vm.$emit('click'); // v-btn is NOT native, thus we can't use trigger(click)
    expect(getEmittedEvent(wrapper, 'input')).toBeFalsy();
  });

  it('should open create object dialog with a sub type preselected', async () => {
    document.body.setAttribute('data-app', 'true'); // Needed to avoid vuetify throwing a warning about not finding the app

    const wrapper = mount(VeoCreateObjectDialog, {
      ...mockDefaults,
      propsData: {
        value: true,
        objectType: 'process',
        domainId: 'my-completely-invalid-domain-uuid-that-doesnt-matter',
        subType: 'PRO_DataProcessing'
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
    const form = wrapper.getComponent(VeoObjectForm);
    (form.find('[data-cy=veo-object-form-display-tab]') as any).element.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const selectWrapper: ChildNode = form.find('[data-cy=veo-object-form-display-select]').element.parentElement as any;
    expect(selectWrapper.firstChild?.textContent).toBe('PRO_DataProcessing');
  });

  it('should check whether the form gets switched if the user uses the display switcher', async () => {
    document.body.setAttribute('data-app', 'true'); // Needed to avoid vuetify throwing a warning about not finding the app

    const wrapper = mount(VeoCreateObjectDialog, {
      ...mockDefaults,
      propsData: {
        value: true,
        objectType: 'process',
        domainId: 'my-completely-invalid-domain-uuid-that-doesnt-matter'
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    (wrapper.find('[data-cy=veo-object-form-display-tab]') as any).element.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const select = getVSelectComponentByDataCy(wrapper, 'veo-object-form-display-select');

    // One label for each custom aspect
    expect(wrapper.findAll('.vf-label')).toHaveLength(12);

    // Switch to formschema
    select.$emit('input', '3ebd14a2-eb7d-4d18-a9ad-2056da85569e');

    // Wait for form to get regenerated
    await new Promise((resolve) => setTimeout(resolve, 200));

    // This form schema contains no labels
    expect(wrapper.findAll('.vf-label')).toHaveLength(0);
  });
});
