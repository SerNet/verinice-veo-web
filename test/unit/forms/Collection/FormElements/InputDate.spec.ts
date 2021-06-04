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

describe('InputDate.vue', () => {
  it('should render input-date element for dates', async () => {
    const form: Renderable = {
      schema: {
        properties: {
          dueDate: {
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
            scope: '#/properties/dueDate',
            options: {
              label: 'Due Date'
            }
          }
        ]
      },
      value: {
        dueDate: '13.08.2019'
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
    expect((controlElement.find('.v-input.v-text-field input').element as HTMLInputElement).value).toBe('13.08.2019');
    expect(controlElement.find('.v-input.v-text-field input').element.hasAttribute('type')).toBe(true);
    expect(controlElement.find('.v-input.v-text-field input').element.getAttribute('type')).toBe('text');

    wrapper.setProps({ value: { dueDate: '20.09.2019' } });
    await flushPromises();
    expect((controlElement.find('.v-input.v-text-field input').element as HTMLInputElement).value).toBe('20.09.2019');

    expect(controlElement.find('.v-input.v-text-field').get('label'));
    expect(controlElement.find('.v-input.v-text-field label').text()).toBe('Due Date');
  });
});
