/*
 * verinice.veo web
 * Copyright (C) 2023 jae
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

import { describe, it, expect } from 'vitest';
import { mockNuxtImport, mockComponent } from 'nuxt-vitest/utils';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';

// @ts-ignore // TS throws 'cannot find module' error, however this module can be found + used
import UserDataCard from '../Card.vue';

// Mock imports
mockNuxtImport('useI18n', () => {
  return () => (msg: string) => msg;
});

// Mock Components
mockComponent('BaseAlert', async () => {
  return {
    setup() {
      return () => h('base-alert-mock', null, 'Mock BaseAlert');
    }
  };
});

// Setup
const vuetify = createVuetify();
const plugins = [vuetify];

const initialProps = {
  header: 'User Data Card Test',
  body: 'Test Body',
  downloadBtnCopy: 'Test Download Button',
  showDownloadIcon: true,
  showAlert: false,
  alertHeader: 'Test Alert Header',
  alertBody: 'Test Alert Body',
  items: [],
  isLoading: [],
  handleClick: (index: number) => index
};

describe('userDataCard.vue', () => {
  const wrapper = mount(UserDataCard, {
    global: { plugins },
    props: initialProps
  });

  it('should show an alert', async () => {
    await wrapper.setProps({ showAlert: true });
    expect(wrapper.find('base-alert-mock[model-value="true"]').exists()).toBe(true);
  });

  it('should list items to be downloaded', async () => {
    const items = [{name: 'test item 1'}, {name: 'test item 2'}];
    await wrapper.setProps({ items });

    const itemNames = wrapper.findAll('h3').map(item => item.text());
    expect(itemNames[0]).toBe(items[0].name);
    expect(itemNames[1]).toBe(items[1].name);
  });
});
