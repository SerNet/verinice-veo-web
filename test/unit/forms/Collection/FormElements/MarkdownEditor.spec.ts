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
import Vue from 'vue';

import { install as VeeValidate } from '@/plugins/vee-validate';

Vue.use(VeeValidate);

describe('MarkdownEditor.vue', () => {
  it('should render select component to choose some list element', async () => {
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
