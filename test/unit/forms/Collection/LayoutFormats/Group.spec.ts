import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import Vue from 'vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import { Renderable } from '~/types/renderable'

import { install as VeeValidate } from '~/plugins/vee-validate'
Vue.use(VeeValidate)
Vue.use(Vuetify)
const vuetify = new Vuetify()

describe('Group.vue', () => {
  it('should render vertical layout', async() => {
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
          direction: 'vertical',
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
            scope: '#/properties/age'
          }
        ]
      },
      value: {
        name: 'test',
        age: 99
      }
    }

    const wrapper = mount(VeoForm, {
      propsData: { ...form }
    })

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate()
    await wrapper.vm.$nextTick()

    const layoutWrapper = wrapper.find('.vf-wrapper > .vf-layout')
    expect(layoutWrapper.exists()).toBe(true)
    expect(layoutWrapper.classes()).toContain('d-flex')
    expect(layoutWrapper.classes()).toContain('flex-column')

    // TODO: get width of input elements and compare with wrapper width.
    // e.g. expect( width of each element ).toBe(width of wrapper)
  })

  it('should render horizontal layout', async() => {
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
            scope: '#/properties/age'
          }
        ]
      },
      value: {
        name: 'test',
        age: 99
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

    // TODO: Better solution to find child layout element
    const layoutWrapper = wrapper.find('.vf-wrapper > .vf-layout')
    expect(layoutWrapper.exists()).toBe(true)
    expect(layoutWrapper.classes()).toContain('d-flex')
    expect(layoutWrapper.classes()).toContain('flex-row')

    // TODO: get width of input elements and compare with wrapper width.
    // e.g. expect( sum(width of each element) ).toBeLessThanOrEqual(width of wrapper)
  })
})
