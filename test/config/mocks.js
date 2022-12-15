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

config.mocks = {
  $t: (t) => t,
  $nuxt: {
    context: {
      $config: {
        accountsApiUrl: 'http://localhost:443/accounts'
      }
    }
  }
};

// Mocks the intersection observer, however not as a jest module mock, as it usually resides in the global scope allowing us to mock it there
function intersectionObserver() {
  return {
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  };
}

window.IntersectionObserver = intersectionObserver;

// Mocks the intersection observer, however not as a jest module mock, as it usually resides in the global scope allowing us to mock it there
function resizeObserver() {
  return {
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  };
}

window.ResizeObserver = resizeObserver;
