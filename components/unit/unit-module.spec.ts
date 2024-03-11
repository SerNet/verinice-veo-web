import { describe, it, expect } from 'vitest';
import { isEqual } from 'lodash';
import { unit0 } from '../../test/data/units';
import { mapUnitValues } from './unit-module';

const testUnit = unit0.data;

describe('mapUnitValues()', () => {
  it('maps unit data correctly', () => {
    const expectedResult = {
      ...unit0.result,
      raw: unit0.data
    };
    const result = mapUnitValues({ unit: testUnit, favoriteUnitId: 'some_id' });
    expect(isEqual(result, expectedResult)).toBe(true);
  });

  it('maps favorite unit correctly', () => {
    const expectedResult = {
      ...unit0.result,
      isFavorite: true,
      raw: unit0.data
    };
    const result = mapUnitValues({ unit: testUnit, favoriteUnitId: testUnit.id });
    expect(isEqual(result, expectedResult)).toBe(true);
  });
});
