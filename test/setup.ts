/*
 * verinice.veo web
 * Copyright (C) 2023 Jakob Epler Jonas Heitmann
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
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { config } from '@vue/test-utils';

export const vuetify = createVuetify({
  components,
  directives
});

try {
  const nuxtApp = useNuxtApp();

  config.global.plugins.push({
    async install(app, ...options) {
      const i18n = (nuxtApp.vueApp as any).__VUE_I18N__;

      await i18n.install(app, ...options);
    }
  });
} catch { /* empty */ }
