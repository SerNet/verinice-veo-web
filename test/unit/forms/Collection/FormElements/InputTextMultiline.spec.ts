import Vue from 'vue';
import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import { install as VeeValidate } from '@/plugins/vee-validate';
import VeoForm from '~/components/forms/VeoForm.vue';
import { Renderable } from '~/types/renderable';

Vue.use(VeeValidate);
Vue.use(Vuetify);
const vuetify = new Vuetify();

describe('InputTextMultiline.vue', () => {
  it('should render Input Text Multiline element for multiline text', async () => {
    const form: Renderable = {
      schema: {
        properties: {
          comment: {
            type: 'string'
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
            label: 'Comment',
            scope: '#/properties/comment',
            options: {
              label: 'Comment',
              format: 'multiline'
            }
          }
        ]
      },
      value: {
        comment: 'This is a\n comment'
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

    expect(controlElement.findAll('.v-input.v-textarea')).toHaveLength(1);
    expect(controlElement.findAll('textarea')).toHaveLength(1);
    expect(controlElement.findAll('label')).toHaveLength(1);

    expect(controlElement.find('.v-input.v-textarea').get('textarea'));
    expect((controlElement.find('.v-input.v-textarea textarea').element as HTMLInputElement).value).toBe('This is a\n comment');
    expect(controlElement.find('.v-input.v-textarea').get('label'));
    expect(controlElement.find('.v-input.v-textarea label').text()).toBe('Comment');
  });
});
