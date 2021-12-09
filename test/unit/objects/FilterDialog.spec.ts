/*
 * verinice.veo web
 * Copyright (C) 2021  Annemarie Bufe
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
import VueI18n from 'vue-i18n';

import VeoFilterDialog from '~/components/layout/VeoFilterDialog.vue';
import VeoDialog from '~/components/layout/VeoDialog.vue';

import * as de from '~/locales/de';
import * as en from '~/locales/en';

import { install as VeeValidate } from '~/plugins/vee-validate';
Vue.use(VeeValidate);
Vue.use(Vuetify);
Vue.use(VueI18n);

const i18n = new VueI18n();
const vuetify = new Vuetify();

// Needed if useI18n() gets used in compoisition api
jest.mock('nuxt-i18n-composable', () => ({
  useI18n() {
    return {
      t: (t: string) => t,
      locale: 'de'
    };
  }
}));

describe('FilterDialog.vue', () => {
  it('should open veo filter dialog with 5 filters and be expandable to 9 filters', async () => {
    const wrapper = mount(VeoFilterDialog, {
      vuetify,
      i18n,
      components: {
        VeoDialog
      },
      mocks: {
        $nuxt: {} // Needed if useFetch() gets used in composition api
      }
    });

    wrapper.find('.filter-button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.veodialog').isVisible()).toBe(true);
    expect(wrapper.findAll('.veofilter').wrappers.length).toBe(5);
    wrapper.find('.expand-button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.veofilter').wrappers.length).toBe(10);
  });

  it('should open veo filter dialog, select a filter and submit selected filter values and reset filter values (no preseted filters)', async () => {
    const wrapper = mount(VeoFilterDialog, {
      vuetify,
      i18n,
      components: {
        VeoDialog
      },
      propsData: {},
      mocks: {
        $nuxt: {} // Needed if useFetch() gets used in composition api
      }
    });
    wrapper.find('.filter-button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.veodialog').isVisible()).toBe(true);
    wrapper.find('[name=designator]').setValue('Designator Text');
    wrapper.find('[name=name]').setValue('Name');
    wrapper.find('.submit-btn').trigger('click');
    await wrapper.vm.$nextTick();
    const submitEvents = wrapper.emitted().input;
    const [submitEvent] = JSON.parse(JSON.stringify(submitEvents?.pop() || []));

    expect(submitEvent).toEqual({
      objectType: undefined,
      subType: undefined,
      designator: 'Designator Text',
      name: 'Name',
      status: undefined,
      description: undefined,
      updatedBy: undefined,
      notPartOfGroup: undefined,
      hasChildObjects: undefined,
      hasLinks: undefined
    });

    wrapper.find('.filter-button').trigger('click');
    await wrapper.vm.$nextTick();
    wrapper.find('.reset-btn').trigger('click');
    await wrapper.vm.$nextTick();
    const resetEvents = wrapper.emitted().reset;
    const [resetEvent] = JSON.parse(JSON.stringify(resetEvents?.pop() || []));

    expect(resetEvent).toEqual({
      objectType: undefined,
      subType: undefined,
      designator: undefined,
      name: undefined,
      status: undefined,
      description: undefined,
      updatedBy: undefined,
      notPartOfGroup: undefined,
      hasChildObjects: undefined,
      hasLinks: undefined
    });
  });

  it('should open veo filter dialog and submit filters (with preset filters)', async () => {
    const wrapper = mount(VeoFilterDialog, {
      vuetify,
      i18n,
      components: {
        VeoDialog
      },
      propsData: { presetFilter: { designator: undefined, name: 'name', description: undefined, updatedBy: undefined, status: undefined } },
      mocks: {
        $nuxt: {} // Needed if useFetch() gets used in composition api
      }
    });

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick();

    wrapper.find('.filter-button').trigger('click');
    await wrapper.vm.$nextTick();
    wrapper.find('[name=designator]').setValue('Designator Text');
    wrapper.find('.submit-btn').trigger('click');
    await wrapper.vm.$nextTick();
    const submitEvents = wrapper.emitted().input;
    const [submitEvent] = JSON.parse(JSON.stringify(submitEvents?.pop() || []));

    expect(submitEvent).toEqual({
      objectType: undefined,
      subType: undefined,
      designator: undefined,
      name: wrapper.props().presetFilter.name,
      status: undefined,
      description: undefined,
      updatedBy: undefined,
      notPartOfGroup: undefined,
      hasChildObjects: undefined,
      hasLinks: undefined
    });
  });
});
