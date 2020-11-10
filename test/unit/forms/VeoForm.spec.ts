import Vue from 'vue'
import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import VeoForm from '~/components/forms/VeoForm.vue'
import { Renderable } from '~/types/renderable'

import { install as VeeValidate } from '~/plugins/vee-validate'
Vue.use(VeeValidate)
Vue.use(Vuetify)
const vuetify = new Vuetify()

describe('VeoForm.vue', () => {
  it("should render second text field if first contains text 'hans'", async() => {
    const form: Renderable = {
      schema: {
        properties: {
          name: {
            type: 'string'
          },
          age: {
            type: 'number'
          }
        }
      },
      ui: {
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
            scope: '#/properties/age',
            rule: {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/name',
                schema: { const: 'hans' }
              }
            }
          }
        ]
      },
      value: { name: 'Markus', age: 29 }
    }

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form }
    })

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate()
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)
    expect(inputs.at(0).element.tagName).toBe('INPUT')

    inputs.at(0).setValue('hans')

    await wrapper.vm.$forceUpdate()

    const inputsAfter = wrapper.findAll('input')
    expect(inputsAfter.length).toBe(1)
  })
})
