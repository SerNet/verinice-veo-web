import Vue from 'vue'
import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import VeoForm from '~/components/forms/VeoForm.vue'

import { install as VeeValidate } from '~/plugins/vee-validate'
import { Renderable } from '~/types/renderable'
Vue.use(VeeValidate)
Vue.use(Vuetify)
const vuetify = new Vuetify()

describe('Label.vue', () => {
  it('should render label component for static text', async() => {
    const form: Renderable = {
      schema: {},
      ui: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text:
              'This is a Label text. \nYou can write here any static text!!!'
          }
        ]
      },
      value: {}
    }

    const wrapper = mount(VeoForm, {
      propsData: { ...form }
    })

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate()
    await wrapper.vm.$nextTick()

    const layoutWrapper = wrapper.find('.vf-wrapper > .vf-layout')
    expect(layoutWrapper.find('.vf-label').exists()).toBe(true)
    expect(
      layoutWrapper.find('.vf-label > div > .vf-label-text').exists()
    ).toBe(true)
    expect(layoutWrapper.find('.vf-label > div > .vf-label-text').text()).toBe(
      'This is a Label text. \nYou can write here any static text!!!'
    )
  })

  it("should add classes to label component in all 3 vue format: {}, [], '' ", async() => {
    const form1: Renderable = {
      schema: {},
      ui: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text:
              'This is a Label text. \nYou can write here any static text!!!',
            options: {
              class: {
                display: true,
                'text-right': true
              }
            }
          }
        ]
      },
      value: {}
    }

    const form2: Renderable = {
      schema: {},
      ui: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text:
              'This is a Label text. \nYou can write here any static text!!!',
            options: {
              class: ['display-1', 'text-center']
            }
          }
        ]
      },
      value: {}
    }

    const form3: Renderable = {
      schema: {},
      ui: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text:
              'This is a Label text. \nYou can write here any static text!!!',
            options: {
              class: 'display-2 text-left'
            }
          }
        ]
      },
      value: {}
    }

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form1 }
    })

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate()
    await wrapper.vm.$nextTick()

    const layoutWrapper = wrapper.find('.vf-wrapper > .vf-layout')
    const labelTextElement = layoutWrapper.find(
      '.vf-label > div > .vf-label-text'
    )
    expect(labelTextElement.classes()).toContain('display')
    expect(labelTextElement.classes()).toContain('text-right')
    wrapper.setProps({ ...form2 })
    await flushPromises()
    expect(labelTextElement.classes()).toContain('display-1')
    expect(labelTextElement.classes()).toContain('text-center')
    wrapper.setProps({ ...form3 })
    await flushPromises()
    expect(labelTextElement.classes()).toContain('display-2')
    expect(labelTextElement.classes()).toContain('text-left')
  })

  it("should add style to label component in all 3 vue format: {}, [], '' ", async() => {
    const form1: Renderable = {
      schema: {},
      ui: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text:
              'This is a Label text. \nYou can write here any static text!!!',
            options: {
              style: {
                fontSize: '14px',
                textAlign: 'right'
              }
            }
          }
        ]
      },
      value: {}
    }

    const form2: Renderable = {
      schema: {},
      ui: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text:
              'This is a Label text. \nYou can write here any static text!!!',
            options: {
              style: [{ fontSize: '16px' }, { textAlign: 'center' }]
            }
          }
        ]
      },
      value: {}
    }

    const form3: Renderable = {
      schema: {},
      ui: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text:
              'This is a Label text. \nYou can write here any static text!!!',
            options: {
              style: 'font-size: 18px; text-align: left;'
            }
          }
        ]
      },
      value: {}
    }

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form1 }
    })

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate()
    await wrapper.vm.$nextTick()

    const layoutWrapper = wrapper.find('.vf-wrapper > .vf-layout')
    const labelTextElement = layoutWrapper.find(
      '.vf-label > div > .vf-label-text'
    )
    expect(labelTextElement.attributes().style).toContain('font-size: 14px;')
    expect(labelTextElement.attributes().style).toContain('text-align: right;')
    wrapper.setProps({ ...form2 })
    await flushPromises()
    expect(labelTextElement.attributes().style).toContain('font-size: 16px;')
    expect(labelTextElement.attributes().style).toContain('text-align: center;')
    wrapper.setProps({ ...form3 })
    await flushPromises()
    expect(labelTextElement.attributes().style).toContain('font-size: 18px;')
    expect(labelTextElement.attributes().style).toContain('text-align: left;')
  })
})
