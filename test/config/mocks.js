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
import { config } from '@vue/test-utils';

import { prefixCyData } from '~/plugins/utils';

config.mocks = {
  $utils: {
    /*
     * NOTE!! This function will not work as when called in the browser (either npm run dev or cypress), at it has no access to $options
     * or $route.
     * This function will thus just return the string one passed to it, however we use it in the template to enable cypress e2e tests in the future
     */
    prefixCyData
  },
  $t: (t) => t
};
