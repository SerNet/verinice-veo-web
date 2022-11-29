/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import path from 'path';
import Vue from 'vue';
import glob from 'glob';
import VueI18n from 'vue-i18n';
import Vuetify from 'vuetify/lib';
import VueCompositionAPI from '@vue/composition-api';
import { VueQueryPlugin } from '@tanstack/vue-query';

// Auto import all components (super inefficient, but saves a lot of lines of code)
glob.sync(path.join(__dirname, '../../components/**/*.vue')).forEach((file) => {
  const name = file.match(/(\w*)\.vue$/)[1];
  Vue.component(name, require(file).default);
});

Vue.config.productionTip = false;
Vue.use(Vuetify);
Vue.use(VueCompositionAPI);
Vue.use(VueQueryPlugin);
Vue.use(VueI18n);

global.Vue = Vue;
