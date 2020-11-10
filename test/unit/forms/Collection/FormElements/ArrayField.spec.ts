import Vue from 'vue'
import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'

import { install as VeeValidate } from '~/plugins/vee-validate'
import VeoForm from '~/components/forms/VeoForm.vue'
import { Renderable } from '~/types/renderable'
Vue.use(VeeValidate)
Vue.use(Vuetify)
const vuetify = new Vuetify()

// TODO: Fix broken tests
const ignore = (...args: any[]) => {}

describe('ArrayField.vue', () => {
  ignore('elements in arrayField must be listed horizontally as default', async() => {
    const form: Renderable = {
      schema: {
        properties: {
          persons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstname: {
                  type: 'string'
                },
                lastname: {
                  type: 'string'
                }
              }
            }
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
            scope: '#/properties/persons',
            elements: [
              {
                type: 'Control',
                scope: '#/properties/firstname',
                options: {
                  label: 'Firstname'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/lastname',
                options: {
                  label: 'Lastname'
                }
              }
            ]
          }
        ]
      },
      value: {
        persons: [
          {
            firstname: 'John',
            lastname: 'Doe',
            age: 18
          }
        ]
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

    const controlElement = wrapper.find(
      '.vf-wrapper > .vf-layout > .vf-control'
    )

    await flushPromises()
    expect(controlElement.findAll('.vf-array-field')).toHaveLength(1)
    const arrayField = controlElement.find('.vf-array-field')

    const numberOfRows = arrayField.findAll('.vf-array-field > .flex-row')
      .length
    expect(numberOfRows).toBe(1)

    expect(
      arrayField.findAll(
        '.vf-array-field > .flex-row > .vf-wrapper > .vf-layout.flex-row'
      )
    ).toHaveLength(1)
    const arrayFieldLayout = arrayField.find(
      '.vf-array-field > .flex-row > .vf-wrapper > .vf-layout.flex-row'
    )
    expect(
      arrayFieldLayout.findAll('.vf-layout.flex-row > .vf-control')
    ).toHaveLength(2)
  })

  ignore('elements in arrayField must be listed horizontally for direction option', async() => {
    const form: Renderable = {
      schema: {
        properties: {
          persons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstname: {
                  type: 'string'
                },
                lastname: {
                  type: 'string'
                }
              }
            }
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
            scope: '#/properties/persons',
            options: {
              direction: 'horizontal'
            },
            elements: [
              {
                type: 'Control',
                scope: '#/properties/firstname',
                options: {
                  label: 'Firstname'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/lastname',
                options: {
                  label: 'Lastname'
                }
              }
            ]
          }
        ]
      },
      value: {
        persons: [
          {
            firstname: 'John',
            lastname: 'Doe',
            age: 18
          }
        ]
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

    const controlElement = wrapper.find(
      '.vf-wrapper > .vf-layout > .vf-control'
    )

    await flushPromises()
    expect(controlElement.findAll('.vf-array-field')).toHaveLength(1)
    const arrayField = controlElement.find('.vf-array-field')

    const numberOfRows = arrayField.findAll('.vf-array-field > .flex-row')
      .length
    expect(numberOfRows).toBe(1)

    expect(
      arrayField.findAll(
        '.vf-array-field > .flex-row > .vf-wrapper > .vf-layout.flex-row'
      )
    ).toHaveLength(1)
    const arrayFieldLayout = arrayField.find(
      '.vf-array-field > .flex-row > .vf-wrapper > .vf-layout.flex-row'
    )
    expect(
      arrayFieldLayout.findAll('.vf-layout.flex-row > .vf-control')
    ).toHaveLength(2)
  })

  ignore('elements in arrayField must be listed vertically for direction option', async() => {
    const form: Renderable = {
      schema: {
        properties: {
          persons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstname: {
                  type: 'string'
                },
                lastname: {
                  type: 'string'
                }
              }
            }
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
            scope: '#/properties/persons',
            options: {
              direction: 'vertical'
            },
            elements: [
              {
                type: 'Control',
                scope: '#/properties/firstname',
                options: {
                  label: 'Firstname'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/lastname',
                options: {
                  label: 'Lastname'
                }
              }
            ]
          }
        ]
      },
      value: {
        persons: [
          {
            firstname: 'John',
            lastname: 'Doe',
            age: 18
          }
        ]
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

    const controlElement = wrapper.find(
      '.vf-wrapper > .vf-layout > .vf-control'
    )

    await flushPromises()
    expect(controlElement.findAll('.vf-array-field')).toHaveLength(1)
    const arrayField = controlElement.find('.vf-array-field')

    const numberOfRows = arrayField.findAll('.vf-array-field > .flex-row')
      .length
    expect(numberOfRows).toBe(1)

    expect(
      arrayField.findAll(
        '.vf-array-field > .flex-row > .vf-wrapper > .vf-layout.flex-column'
      )
    ).toHaveLength(1)
    const arrayFieldLayout = arrayField.find(
      '.vf-array-field > .flex-row > .vf-wrapper > .vf-layout.flex-column'
    )
    expect(
      arrayFieldLayout.findAll('.vf-layout.flex-column > .vf-control')
    ).toHaveLength(2)
  })

  ignore('should render arrayfield element for a list with multiple fields per row', async() => {
    const form: Renderable = {
      schema: {
        properties: {
          persons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstname: {
                  type: 'string'
                },
                lastname: {
                  type: 'string'
                },
                age: {
                  type: 'number'
                },
                isMarried: {
                  type: 'boolean'
                },
                status: {
                  type: 'string',
                  enum: ['Pupil', 'Student', 'Employee', 'Pensioner']
                }
              }
            }
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
            scope: '#/properties/persons',
            elements: [
              {
                type: 'Control',
                scope: '#/properties/firstname',
                options: {
                  label: 'Firstname'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/lastname',
                options: {
                  label: 'Lastname'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/age',
                options: {
                  label: 'Age'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/isMarried',
                options: {
                  label: 'Are you Married?'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/status',
                options: {
                  label: 'Status'
                }
              }
            ]
          }
        ]
      },
      value: {
        persons: [
          {
            firstname: 'John',
            lastname: 'Doe',
            age: 18,
            isMarried: false,
            status: 'Student'
          }
        ]
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

    const controlElement = wrapper.find(
      '.vf-wrapper > .vf-layout > .vf-control'
    )

    await flushPromises()
    expect(controlElement.findAll('.vf-array-field')).toHaveLength(1)
    const arrayField = controlElement.find('.vf-array-field')

    let numberOfRows = arrayField.findAll('.vf-array-field > .flex-row').length
    expect(numberOfRows).toBe(1)

    expect(
      arrayField.findAll(
        '.vf-array-field > .flex-row > .vf-wrapper > .vf-layout.flex-row'
      )
    ).toHaveLength(1)
    const arrayFieldLayout = arrayField.find(
      '.vf-array-field > .flex-row > .vf-wrapper > .vf-layout.flex-row'
    )
    expect(
      arrayFieldLayout.findAll('.vf-layout.flex-row > .vf-control')
    ).toHaveLength(5)
    const arrayFieldControlElements = arrayFieldLayout.findAll(
      '.vf-layout.flex-row > .vf-control'
    )
    expect(
      (arrayFieldControlElements.at(0).find('input')
        .element as HTMLInputElement).value
    ).toBe('John')
    expect(
      (arrayFieldControlElements.at(1).find('input')
        .element as HTMLInputElement).value
    ).toBe('Doe')
    expect(
      (arrayFieldControlElements.at(2).find('input')
        .element as HTMLInputElement).value
    ).toBe('18')
    expect(
      arrayFieldControlElements
        .at(3)
        .find('input')
        .element.getAttribute('aria-checked')
    ).toBe('false')
    expect(
      arrayFieldControlElements
        .at(4)
        .find('.v-select__selection')
        .text()
    ).toBe('Student')

    wrapper.setProps({
      value: {
        persons: [
          {
            firstname: 'John',
            lastname: 'Doe',
            age: 18,
            isMarried: false,
            status: 'Student'
          },
          {
            firstname: 'John',
            lastname: 'Doe',
            age: 18,
            isMarried: false,
            status: 'Student'
          }
        ]
      }
    })
    await flushPromises()
    numberOfRows = arrayField.findAll('.vf-array-field > .flex-row').length
    expect(numberOfRows).toBe(2)
  })

  it('should change row number arrafield row number with add and remove buttons', async() => {
    const form: Renderable = {
      schema: {
        properties: {
          persons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstname: {
                  type: 'string'
                },
                lastname: {
                  type: 'string'
                },
                age: {
                  type: 'number'
                },
                isMarried: {
                  type: 'boolean'
                },
                status: {
                  type: 'string',
                  enum: ['Pupil', 'Student', 'Employee', 'Pensioner']
                }
              }
            }
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
            scope: '#/properties/persons',
            elements: [
              {
                type: 'Control',
                scope: '#/properties/firstname',
                options: {
                  label: 'Firstname'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/lastname',
                options: {
                  label: 'Lastname'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/age',
                options: {
                  label: 'Age'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/isMarried',
                options: {
                  label: 'Are you Married?'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/status',
                options: {
                  label: 'Status'
                }
              }
            ]
          }
        ]
      },
      value: {
        persons: [
          {
            firstname: 'John',
            lastname: 'Doe',
            age: 18,
            isMarried: false,
            status: 'Student'
          }
        ]
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

    const controlElement = wrapper.find(
      '.vf-wrapper > .vf-layout > .vf-control'
    )

    await flushPromises()
    expect(controlElement.findAll('.vf-array-field')).toHaveLength(1)
    const arrayField = controlElement.find('.vf-array-field')

    let numberOfRows = arrayField.findAll('.vf-array-field > .flex-row').length
    expect(numberOfRows).toBe(1)

    expect(arrayField.findAll('.vf-btn-add')).toHaveLength(1)
    arrayField.find('button.vf-btn-add').trigger('click')
    // Very Important to forceUpdate arrayField, otherwise it will not update DOM !!!
    arrayField.vm.$forceUpdate()
    await flushPromises()
    numberOfRows = arrayField.findAll('.vf-array-field > .flex-row').length
    expect(numberOfRows).toBe(2)

    expect(arrayField.findAll('.vf-btn-remove')).toHaveLength(2)
    arrayField
      .findAll('button.vf-btn-remove')
      .at(1)
      .trigger('click')
    // Very Important to forceUpdate arrayField, otherwise it will not update DOM !!!
    arrayField.vm.$forceUpdate()
    await flushPromises()
    numberOfRows = arrayField.findAll('.vf-array-field > .flex-row').length
    expect(numberOfRows).toBe(1)
  })
})
