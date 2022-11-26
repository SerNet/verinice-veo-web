/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Markus Werner
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import flushPromises from 'flush-promises';

import VeoForm from '~/components/forms/VeoForm.vue';

const vuetify = new Vuetify();

describe('Label.vue', () => {
  it('should render label component for static text', async () => {
    const form = {
      objectSchema: {},
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text: 'This is a Label text. \nYou can write here any static text!!!'
          }
        ]
      },
      value: {}
    };

    const wrapper = mount(VeoForm, {
      propsData: { ...form },
      mocks: {
        $nuxt: {
          context: {
            app: {
              i18n: {
                t: (v: string) => v,
                locale: 'de'
              }
            }
          }
        }
      }
    });

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick();

    const layoutWrapper = wrapper.find('.vf-wrapper > .vf-layout');
    expect(layoutWrapper.find('.vf-label').exists()).toBe(true);
    expect(layoutWrapper.find('.vf-label').exists()).toBe(true);
    expect(layoutWrapper.find('.vf-label').text()).toBe('This is a Label text. \nYou can write here any static text!!!');
  });

  it("should add classes to label component in all 3 vue format: {}, [], '' ", async () => {
    const form1 = {
      objectSchema: {},
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text: 'This is a Label text. \nYou can write here any static text!!!',
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
    };

    const form2 = {
      objectSchema: {},
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text: 'This is a Label text. \nYou can write here any static text!!!',
            options: {
              class: ['display-1', 'text-center']
            }
          }
        ]
      },
      value: {}
    };

    const form3 = {
      objectSchema: {},
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text: 'This is a Label text. \nYou can write here any static text!!!',
            options: {
              class: 'display-2 text-left'
            }
          }
        ]
      },
      value: {}
    };

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form1 },
      mocks: {
        $nuxt: {
          context: {
            app: {
              i18n: {
                t: (v: string) => v,
                locale: 'de'
              }
            }
          }
        }
      }
    });

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick();

    let labelTextElement = wrapper.find('.vf-wrapper > .vf-layout .vf-label');
    expect(labelTextElement.classes()).toContain('display');
    expect(labelTextElement.classes()).toContain('text-right');
    wrapper.setProps({ ...form2 });
    await flushPromises();
    labelTextElement = wrapper.find('.vf-wrapper > .vf-layout .vf-label');
    expect(labelTextElement.classes()).toContain('display-1');
    expect(labelTextElement.classes()).toContain('text-center');
    wrapper.setProps({ ...form3 });
    await flushPromises();
    labelTextElement = wrapper.find('.vf-wrapper > .vf-layout .vf-label');
    expect(labelTextElement.classes()).toContain('display-2');
    expect(labelTextElement.classes()).toContain('text-left');
  });

  it("should add style to label component in all 3 vue format: {}, [], '' ", async () => {
    const form1 = {
      objectSchema: {},
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text: 'This is a Label text. \nYou can write here any static text!!!',
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
    };

    const form2 = {
      objectSchema: {},
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text: 'This is a Label text. \nYou can write here any static text!!!',
            options: {
              style: [{ fontSize: '16px' }, { textAlign: 'center' }]
            }
          }
        ]
      },
      value: {}
    };

    const form3 = {
      objectSchema: {},
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Label',
            text: 'This is a Label text. \nYou can write here any static text!!!',
            options: {
              style: 'font-size: 18px; text-align: left;'
            }
          }
        ]
      },
      value: {}
    };

    const wrapper = mount(VeoForm, {
      vuetify,
      propsData: { ...form1 },
      mocks: {
        $nuxt: {
          context: {
            app: {
              i18n: {
                t: (v: string) => v,
                locale: 'de'
              }
            }
          }
        }
      }
    });

    // Fixes immediate:true bugs with setProps() of vue test utils
    // https://github.com/vuejs/vue-test-utils/issues/1140#issuecomment-544156893
    wrapper.vm.$parent.$forceUpdate();
    await wrapper.vm.$nextTick();

    let labelTextElement = wrapper.find('.vf-wrapper > .vf-layout .vf-label');
    expect(labelTextElement.attributes().style).toContain('font-size: 14px;');
    expect(labelTextElement.attributes().style).toContain('text-align: right;');
    wrapper.setProps({ ...form2 });
    await flushPromises();
    labelTextElement = wrapper.find('.vf-wrapper > .vf-layout .vf-label');
    expect(labelTextElement.attributes().style).toContain('font-size: 16px;');
    expect(labelTextElement.attributes().style).toContain('text-align: center;');
    wrapper.setProps({ ...form3 });
    await flushPromises();
    labelTextElement = wrapper.find('.vf-wrapper > .vf-layout .vf-label');
    expect(labelTextElement.attributes().style).toContain('font-size: 18px;');
    expect(labelTextElement.attributes().style).toContain('text-align: left;');
  });
});
