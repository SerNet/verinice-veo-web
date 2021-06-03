import { install as VeeValidate } from '@/plugins/vee-validate';
import Vue from 'vue';
import Vuetify from 'vuetify';
import { Renderable } from '~/types/renderable';

Vue.use(VeeValidate);
Vue.use(Vuetify);
const vuetify = new Vuetify();

describe('MarkdownEditor.vue', () => {
  it('should render select component to choose some list element', async () => {
    const form: Renderable = {
      schema: {
        properties: {
          markdown: {
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
            scope: '#/properties/markdown',
            options: {
              label: 'Markdown Editor',
              format: 'markdown'
            }
          }
        ]
      },
      value: {
        markdown: '# Header'
      }
    };

    // TODO: Fix Error - TypeError: Right-hand side of 'instanceof' is not an object
    // Stubs does not work for Editor.vue. It can only stub FormElement and LayoutFormat, but not other components

    // const wrapper = mount(VeoForm, {
    //   vuetify,
    //   propsData: { ...form },
    //   stubs: {
    //     editor: true,
    //   },
    // })

    // // Fixes immediate:true bugs with setProps() of vue test utils
    // // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    // wrapper.vm.$parent.$forceUpdate()
    // await wrapper.vm.$nextTick()
  });
});
