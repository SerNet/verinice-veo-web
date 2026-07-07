/*
 * verinice.veo web
 * Copyright (C) 2026 at
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
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { nextTick } from 'vue';

import EncodingDialog from '~/components/object/EncodingDialog.vue';

beforeAll(() => {
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
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('EncodingDialog', () => {
  it('renders dialog content when dialog is open', async () => {
    await mountSuspended(EncodingDialog, {
      props: {
        modelValue: true
      }
    });

    expect(document.querySelector('[data-veo-test="encoding-dialog"]')).toBeTruthy();
    expect(document.querySelector('[data-veo-test="confirm-encoding-button"]')).toBeTruthy();
  });

  it('emits confirm with default encoding and closes dialog', async () => {
    const wrapper = await mountSuspended(EncodingDialog, {
      props: {
        modelValue: true
      }
    });

    const confirmButton = document.querySelector('[data-veo-test="confirm-encoding-button"]') as HTMLElement;

    expect(confirmButton).toBeTruthy();

    confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(wrapper.emitted('confirm')).toEqual([['UTF-8']]);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('emits selected encoding when another encoding is selected', async () => {
    const wrapper = await mountSuspended(EncodingDialog, {
      props: {
        modelValue: true
      }
    });

    const select = wrapper.findComponent({ name: 'VSelect' });

    expect(select.exists()).toBe(true);

    await select.vm.$emit('update:modelValue', 'ISO-8859-1');
    await nextTick();

    const confirmButton = document.querySelector('[data-veo-test="confirm-encoding-button"]') as HTMLElement;

    expect(confirmButton).toBeTruthy();

    confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(wrapper.emitted('confirm')).toEqual([['ISO-8859-1']]);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('closes dialog when cancel is clicked', async () => {
    const wrapper = await mountSuspended(EncodingDialog, {
      props: {
        modelValue: true
      }
    });

    const cancelButton = document.querySelector('[data-veo-test="cancel-encoding-button"]') as HTMLElement;

    expect(cancelButton).toBeTruthy();

    cancelButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    expect(wrapper.emitted('confirm')).toBeUndefined();
  });
});
