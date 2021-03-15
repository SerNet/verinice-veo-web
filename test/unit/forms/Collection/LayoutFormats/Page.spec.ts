import VeeValidate from '@/plugins/vee-validate'
import { mount } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VeoForm from '~/components/forms/VeoForm.vue'
import { Renderable } from '~/types/renderable'

Vue.use(VeeValidate)
Vue.use(Vuetify)
const vuetify = new Vuetify()

describe('Layout.vue', () => {
  it('should render page layout', async() => {
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
    expect(layoutWrapper.classes()).toContain('vf-group')
    expect(layoutWrapper.classes()).toContain('col-md-auto')
    expect(layoutWrapper.classes()).toContain('col-12')

    const pageSelector = wrapper.findAll(
      '.vf-wrapper > .vf-layout >  .row > .col > .row > .vf-layout.vf-page'
    )
    expect(pageSelector.exists()).toBe(true)
  })

  it('should render page pagination', async() => {
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
                text: 'This is test Label'
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
                type: 'Control',
                label: 'Name',
                scope: '#/properties/name'
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
                type: 'Control',
                label: 'Age',
                scope: '#/properties/age'
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

    const paginationSelector = wrapper.find('.vf-wrapper > nav > .v-pagination')

    expect(paginationSelector.exists()).toBe(true)

    // TODO: It does not work, Pagination is not generated fully to HTML. Find solution to test
    const paginationItemsSelector = wrapper.findAll(
      '.vf-wrapper > .v-pagination > li'
    )

    // TODO: Fix the test bug when v-pagination is rendered
    // console.log(paginationSelector.html())
    // expect(paginationItemsSelector).toHaveLength(3)
  })
})
