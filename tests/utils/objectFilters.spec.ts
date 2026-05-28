import { describe, expect, it } from 'vitest';
import { getObjectSearchFilters, OBJECT_FILTER_KEYS } from '~/composables/search/objectFilters';

describe('object filters', () => {
  it('should return all object filter keys as structured search filters', () => {
    // given
    const expectedDefaultFilter = { key: 'name', value: 'name' };

    // when
    const filters = getObjectSearchFilters();

    // then
    expect(filters.all).toEqual(OBJECT_FILTER_KEYS.map((key) => ({ key, value: key })));
    expect(filters.default).toEqual(expectedDefaultFilter);
  });

  it('should exclude selected filter keys from structured search filters', () => {
    // given
    const excludedKeys = ['objectType'];

    // when
    const filters = getObjectSearchFilters(excludedKeys);

    // then
    expect(filters.all.map((filter) => filter.key)).not.toContain('objectType');
    expect(filters.default).toEqual({ key: 'name', value: 'name' });
  });

  it('should exclude multiple selected filter keys from structured search filters', () => {
    // given
    const excludedKeys = ['objectType', 'status', 'hasChildElements'];

    // when
    const filters = getObjectSearchFilters(excludedKeys);

    // then
    expect(filters.all.map((filter) => filter.key)).not.toContain('objectType');
    expect(filters.all.map((filter) => filter.key)).not.toContain('status');
    expect(filters.all.map((filter) => filter.key)).not.toContain('hasChildElements');
  });

  it('should use first available filter when default filter is excluded', () => {
    // given
    const excludedKeys = ['name'];

    // when
    const filters = getObjectSearchFilters(excludedKeys);

    // then
    expect(filters.default).toEqual(filters.all[0]);
    expect(filters.default).toEqual({ key: 'objectType', value: 'objectType' });
  });
});
