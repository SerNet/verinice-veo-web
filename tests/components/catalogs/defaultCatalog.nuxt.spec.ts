import { vi, describe, it, expect, beforeAll, afterEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

import { catalogItems } from '~/tests/fixtures/catalogItems';
import * as translations from '~/composables/Translations';

import DefaultCatalog from '~/components/catalog/DefaultCatalog.vue';

import type { IVeoPaginatedResponse, IVeoEntity } from '~/types/VeoTypes';
import type { VueWrapper } from '@vue/test-utils';

type TDefaultCatalog = InstanceType<typeof DefaultCatalog>;

// Mocks
vi.mock('~/composables/Translations');
const useTranslationsMock = vi.mocked(translations.useTranslations);

// @ts-ignore it's a mock
useTranslationsMock.mockImplementation(() => []);

// DATA
const props = {
  catalogItems: catalogItems as IVeoPaginatedResponse<IVeoEntity[]> | undefined,
  modelValue: [],
  isLoading: true,
  isApplyingItems: true
};

describe('DefaultCatalog', () => {
  let component: VueWrapper<TDefaultCatalog>;

  beforeAll(async () => {
    component = await mountSuspended(DefaultCatalog, {
      props
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders catalog table header correctly', () => {
    const headers = component.findAll('th');

    // @ts-ignore temporary
    expect(headers[1].html()).to.contain('objectlist.abbreviation');
    expect(headers[2].html()).to.contain('objectlist.name');
    expect(headers[3].html()).to.contain('objectlist.description');
  });

  it('renders catalog items correctly', () => {
    // Get all rows
    const rows = component.findAll('tr');

    // Iterate over all rows to isolate its data
    // row 0 is table header, row 1 is progress bar
    for (let row = 2; row < rows.length; row++) {
      const rowData = rows[row].findAll('td');
      const { abbreviation, name, description } = catalogItems.items[row - 2];
      const items = [abbreviation ?? '', name ?? '', description ?? ''];

      // i == 0 is the checkbox of each table row
      for (let i = 1; i < rowData.length; i++) {
        const dataPoint = rowData[i];
        expect(dataPoint.text()).to.eq(items[i - 1]);
      }
    }
  });
});
