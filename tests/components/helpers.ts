/*
 * verinice.veo web
 * Copyright (C) 2026 jae
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import { expect, vi } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';

function expectElements(component: VueWrapper<any>, selectors: string[], shouldExist: boolean = true) {
  selectors.forEach((selector) => {
    const element = component.find(selector);
    expect(element.exists()).toBe(shouldExist);
  });
}

export function expectElementsToExist(component: VueWrapper<any>, selectors: string[]) {
  expectElements(component, selectors, true);
}

export function expectElementsNotToExist(component: VueWrapper<any>, selectors: string[]) {
  expectElements(component, selectors, false);
}

export function defineViewport() {
  Object.defineProperty(window, 'visualViewport', {
    writable: true,
    configurable: true,
    value: {
      width: 400,
      height: 200,
      offsetTop: 0,
      offsetLeft: 0,
      pageTop: 0,
      pageLeft: 0,
      scale: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  });
}
