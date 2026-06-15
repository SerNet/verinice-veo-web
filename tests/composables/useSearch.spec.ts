/*
 * verinice.veo web
 * Copyright (C) 2026 azk
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

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';

import type { VeoSearch, VeoSearchFilters } from '~/types/VeoSearch';

const routeQuery = ref<Record<string, string>>({});

mockNuxtImport('useRoute', () => {
  return () => ({
    query: routeQuery.value
  });
});

const { getSearchQueryParameters, useUrlFilters } = await import('~/composables/search/useSearch');

describe('getSearchQueryParameters()', () => {
  it('returns an empty object for an empty search without allowed keys', () => {
    expect(getSearchQueryParameters([])).toEqual({});
  });

  it('resets all allowed keys to undefined for an empty search', () => {
    expect(getSearchQueryParameters([], ['name', 'status'])).toEqual({
      name: undefined,
      status: undefined
    });
  });

  it('maps searchFilter to term when no allowed keys are given', () => {
    const search: VeoSearch[] = [
      { searchFilter: 'name', operator: '=', term: 'foo' },
      { searchFilter: 'status', operator: '=', term: 'NEW' }
    ];

    expect(getSearchQueryParameters(search)).toEqual({ name: 'foo', status: 'NEW' });
  });

  it('ignores entries without a searchFilter', () => {
    const search: VeoSearch[] = [
      { searchFilter: 'name', operator: '=', term: 'foo' },
      { operator: '=', term: 'orphan' }
    ];

    expect(getSearchQueryParameters(search)).toEqual({ name: 'foo' });
  });

  it('drops entries whose searchFilter is not in the allowed keys', () => {
    const search: VeoSearch[] = [
      { searchFilter: 'name', operator: '=', term: 'foo' },
      { searchFilter: 'notAllowed', operator: '=', term: 'bar' }
    ];

    expect(getSearchQueryParameters(search, ['name', 'status'])).toEqual({
      name: 'foo',
      status: undefined
    });
  });

  // Regression for verinice-veo#4880: a filter that is no longer part of the
  // search must be reset to undefined instead of keeping its previous value.
  it('resets allowed keys that are absent from the search to undefined', () => {
    const search: VeoSearch[] = [{ searchFilter: 'name', operator: '=', term: 'foo' }];

    expect(getSearchQueryParameters(search, ['name', 'status', 'hasChildElements'])).toEqual({
      name: 'foo',
      status: undefined,
      hasChildElements: undefined
    });
  });

  it('lets a present filter override the reset placeholder', () => {
    const search: VeoSearch[] = [{ searchFilter: 'status', operator: '=', term: 'NEW' }];
    const result = getSearchQueryParameters(search, ['status']);

    expect(result.status).toBe('NEW');
    expect(Object.keys(result)).toEqual(['status']);
  });
});

describe('useUrlFilters()', () => {
  const filters: VeoSearchFilters = {
    all: [
      { key: 'name', value: 'name' },
      { key: 'status', value: 'status' }
    ],
    default: { key: 'name', value: 'name' }
  };

  it('seeds the search from matching URL query parameters', () => {
    routeQuery.value = { status: 'NEW', name: 'foo' };
    const search = ref<VeoSearch[]>([]);

    useUrlFilters(filters, search);

    expect(search.value).toEqual([
      { searchFilter: 'name', operator: '=', term: 'foo' },
      { searchFilter: 'status', operator: '=', term: 'NEW' }
    ]);
  });

  it('ignores query parameters that are not configured as filters', () => {
    routeQuery.value = { status: 'NEW', unknown: 'ignored' };
    const search = ref<VeoSearch[]>([]);

    useUrlFilters(filters, search);

    expect(search.value).toEqual([{ searchFilter: 'status', operator: '=', term: 'NEW' }]);
  });

  it('leaves the search empty when no query parameter matches a filter', () => {
    routeQuery.value = { unknown: 'ignored' };
    const search = ref<VeoSearch[]>([{ searchFilter: 'stale', operator: '=', term: 'old' }]);

    useUrlFilters(filters, search);

    expect(search.value).toEqual([]);
  });
});
