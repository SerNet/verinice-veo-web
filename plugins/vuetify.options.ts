/*
 * verinice.veo web
 * Copyright (C) 2021  Markus Werner, Jonas Heitmann
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
import 'material-design-icons-iconfont/dist/material-design-icons.css'; // Ensure you are using css-loader
import 'roboto-fontface/css/roboto/roboto-fontface.css'; // Ensure you are using css-loader
import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader
import colors from 'vuetify/lib/util/colors';
import de from 'vuetify/src/locale/de';

export default {
  icons: {
    iconfont: 'mdi'
  },
  lang: {
    locales: { de },
    current: 'de'
  },
  theme: {
    themes: {
      light: {
        primary: '#c90000',
        secondary: colors.red.darken3,
        accent: colors.grey.darken1,
        error: '#c90000',
        // info:,
        // success:,
        // warning:,
        grey: '#d7d7d7',
        lightGrey: '#fafafa'
      }
    }
  }
};
