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
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { de, en } from 'vuetify/locale';
import 'vuetify/styles';
import Cookies from 'js-cookie';

// Vuetify Lab components
import { VDateInput } from 'vuetify/labs/VDateInput';

const vuetify = createVuetify({
  components: {
    ...components,
    VDateInput
  },
  directives,
  ssr: true,
  icons: {
    aliases,
    sets: {
      mdi
    },
    defaultSet: 'mdi' // This is already the default value - only for display purposes
  },
  locale: {
    // adapter: createVueI18nAdapter({ i18n, useI18n }) // Currently doesn't work with nuxt
    locale: Cookies.get('i18n_redirected') || navigator.language.split('-')[0],
    messages: { de, en }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#c90000',
          // secondary: '#',
          accent: '#ddd',
          surface: '#fff',
          color: '#000',
          basepage: '#f3f3f3'
          // error: '#',
          // info: '#'
          // success: '#',
          // warning: '#'
        },
        variables: {
          'disabled-opacity': 0.6
        }
      },
      dark: {
        colors: {
          primary: '#c90000',
          // secondary: '#',
          accent: '#000',
          surface: '#1c1c1c',
          color: '#fff',
          basepage: '#303030'
          // error: '#',
          // info: '#'
          // success: '#',
          // warning: '#'
        },
        variables: {
          'disabled-opacity': 0.6
        }
      }
    }
  }
});

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(vuetify);
});
