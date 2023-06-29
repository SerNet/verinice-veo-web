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
import { mockNuxtImport } from 'nuxt-vitest/utils';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { t } from '~~/test/mocks';

// @ts-ignore // TS throws 'cannot find module' error, however this module can be found + used
import HistoryExport from '../HistoryExport.vue';

// Mock imports
mockNuxtImport('useI18n', () => {
  return () => (msg: string) => msg;
});

// Setup
const vuetify = createVuetify();
const plugins = [vuetify];
const mocks = { t };

describe('HistoryExport.vue', () => {
  const wrapper = mount(HistoryExport, {
    global: { plugins, mocks }
  });

  it('should render a loader', async () => {
    /*
    const prepareDownloadBtn = wrapper.find('button');
    console.log(prepareDownloadBtn.html())
    await prepareDownloadBtn.trigger('click');
    expect(prepareDownloadBtn.find('.v-btn__loader').exists()).toBe(true);
    */
  });

});

