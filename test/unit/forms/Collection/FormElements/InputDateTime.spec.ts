import Vue from 'vue'
import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'

import { install as VeeValidate } from '@/plugins/vee-validate'
import VeoForm from '~/components/forms/VeoForm.vue'
import { Renderable } from '~/types/renderable'
Vue.use(VeeValidate)
Vue.use(Vuetify)
const vuetify = new Vuetify()

describe('InputDateTime.vue', () => {
  it('should render input-date-time element for date-times', async() => {
    const form: Renderable = {
      schema: {
        properties: {
          dueDateTime: {
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
            scope: '#/properties/dueDateTime',
            options: {
              label: 'Due Date-Time'
            }
          }
        ]
      },
      value: {
        dueDateTime: '2020-08-05T12:05:00+02:00'
      }
    }

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form }
    })

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate()
    await wrapper.vm.$nextTick()

    const inputElement = wrapper.find(
      '.vf-wrapper > .vf-layout > .vf-control .v-input.v-text-field input'
    ).element as HTMLInputElement

    expect(wrapper.element).toMatchSnapshot('Initial render')

    expect(inputElement.value).toBe('2020-08-05T12:05:00+02:00')

    wrapper.setProps({
      value: { dueDateTime: '1999-08-05T12:05:00+02:00' }
    })
    await flushPromises()

    expect(wrapper.element).toMatchSnapshot('Updated DateTime')

    expect(inputElement.value).toBe('1999-08-05T12:05:00+02:00')
  })
})
