import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import Vue from 'vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import { Renderable } from '~/types/renderable'

import { install as VeeValidate } from '~/plugins/vee-validate'
Vue.use(VeeValidate)
Vue.use(Vuetify)
const vuetify = new Vuetify()

describe('Layout.vue', () => {
  it('should render certain layout', async () => {
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
            type: 'Layout',
            options: {
              format: 'page'
            },
            elements: [
              {
                type: 'Label',
                text: 'Page 1'
              },
              {
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
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              format: 'page'
            },
            elements: [
              {
                type: 'Label',
                text: 'Page 2'
              },
              {
                type: 'Label',
                text: 'It is test label'
              }
            ]
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

    const layoutWrapper = wrapper.find('.vf-wrapper > .vf-layout')
    expect(layoutWrapper.exists()).toBe(true)
    expect(layoutWrapper.classes()).toContain('vf-group')
    expect(layoutWrapper.classes()).toContain('col-md-auto')
    expect(layoutWrapper.classes()).toContain('col-12')

    expect(layoutWrapper.exists()).toBe(true)

    const horitontalLayoutSelector = wrapper.find('#elements-0-elements-1.vf-group .row.direction-horizontal')
    expect(horitontalLayoutSelector.exists()).toBe(true)
    expect(horitontalLayoutSelector.classes()).toContain('flex-row')
    expect(horitontalLayoutSelector.classes()).toContain('direction-horizontal')
  })
})
