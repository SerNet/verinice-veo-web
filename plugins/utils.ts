/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann
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
import { Plugin } from '@nuxt/types';
import { defineNuxtPlugin } from '@nuxtjs/composition-api';
import { kebabCase } from 'lodash';
import Vue from 'vue';

/**
 * @see {@link ~/composables/utils.ts} for Composition API variant or use `v-cy-name` directive
 */
export function prefixCyData(options: any, name: string, route?: any) {
  return `${kebabCase(options._componentTag || route?.name)}-${name}`;
}

export default defineNuxtPlugin(function (_context, inject) {
  const utils = {
    prefixCyData
  };

  inject('utils', utils);
} as Plugin);

/**
 * Set data-cy attribute and prefix name with component name
 * @example `v-cy-name="'cypress-name'"`
 */
Vue.directive('cyName', (el, binding, vnode) => {
  const componentName = vnode.context?.$options.name;
  const prefix = componentName;
  const name = binding.value;
  const value = [prefix && kebabCase(prefix), name].flat().join('-');
  el.setAttribute('data-cy', value);
});
