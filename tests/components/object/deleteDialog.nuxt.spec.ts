/*
 * verinice.veo web
 * Copyright (C) 2026 djm
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';

import DeleteDialog from '~/components/object/DeleteDialog.vue';
import type { IVeoEntity } from '~/types/VeoTypes';

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(
    (_definition: unknown, _parameters: { value: unknown }, _options: { enabled: { value: boolean } }) => ({
      data: {
        value: {
          domains: {
            'domain-1': {},
            'domain-2': {},
            'domain-3': {}
          }
        }
      },
      isLoading: { value: false },
      isError: { value: false }
    })
  )
}));

vi.mock('~/composables/api/utils/query', async (importOriginal) => {
  const original = (await importOriginal()) as object;
  return { ...original, useQuery: useQueryMock };
});

vi.mock('~/composables/api/utils/mutation', () => ({
  useMutation: () => ({ mutateAsync: vi.fn() })
}));

mockNuxtImport('useRoute', () => {
  return () => ({ params: { unit: 'unit-1' } });
});

mockNuxtImport('useUnit', () => {
  return () => ({
    data: {
      value: {
        domains: [
          { id: 'domain-1', name: 'DSGVO (DE)' },
          { id: 'domain-2', name: 'IT-Grundschutz' },
          { id: 'domain-3', name: 'NIS2 (DE)' }
        ]
      }
    },
    isLoading: { value: false },
    isError: { value: false }
  });
});

mockNuxtImport('useVeoPermissions', () => {
  return () => ({
    ability: {
      value: { can: () => true }
    },
    subject: (_type: string, value: unknown) => value
  });
});

beforeAll(() => {
  Object.defineProperty(window, 'visualViewport', {
    writable: true,
    configurable: true,
    value: {
      width: 800,
      height: 600,
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

beforeEach(() => {
  useQueryMock.mockClear();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ObjectDeleteDialog', () => {
  it('lists every domain associated with the object', async () => {
    const item = {
      id: 'asset-1',
      type: 'asset',
      displayName: 'AST-26398 yolon'
    } as IVeoEntity;

    await mountSuspended(DeleteDialog, {
      props: {
        modelValue: true,
        items: [item]
      }
    });

    const domains = document.querySelector('[data-veo-test="object-delete-associated-domains"]');

    expect(domains?.textContent).toContain('DSGVO (DE)');
    expect(domains?.textContent).toContain('IT-Grundschutz');
    expect(domains?.textContent).toContain('NIS2 (DE)');
    expect(useQueryMock.mock.calls[0]?.[1]?.value).toEqual({
      endpoint: 'assets',
      id: 'asset-1'
    });
  });

  it('does not fetch or list domains when multiple objects are selected', async () => {
    const items = [
      { id: 'asset-1', type: 'asset', displayName: 'Asset one' },
      { id: 'asset-2', type: 'asset', displayName: 'Asset two' }
    ] as IVeoEntity[];

    await mountSuspended(DeleteDialog, {
      props: {
        modelValue: true,
        items
      }
    });

    expect(document.querySelector('[data-veo-test="object-delete-associated-domains"]')).toBeNull();
    expect(useQueryMock.mock.calls[0]?.[2].enabled.value).toBe(false);
  });
});
