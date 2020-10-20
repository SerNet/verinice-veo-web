import Vue from 'vue'
import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import { install as VeeValidate } from '@/plugins/vee-validate'
import VeoForm from '~/components/forms/VeoForm.vue'
import { Renderable } from '~/types/renderable'

Vue.use(VeeValidate)
Vue.use(Vuetify)
const vuetify = new Vuetify()

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
    }
    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form }
    })
    // Usage of Snapshots with Vue: https://www.digitalocean.com/community/tutorials/vuejs-jest-snapshot-testing-in-vue
    expect(wrapper.element).toMatchSnapshot('Initial render')
  })
})
