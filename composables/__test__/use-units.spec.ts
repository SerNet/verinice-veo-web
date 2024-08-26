/*
 * verinice.veo web
 * Copyright (C) 2024 jae
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
import { isEqual } from 'lodash';
import { unit0 } from '~/test/data/units';
import { mapUnitValues } from '~/composables/units/useUnits';

const testUnit = unit0.data;

describe('mapUnitValues()', () => {
  it('maps unit data correctly', () => {
    const expectedResult = {
      ...unit0.result,
      raw: unit0.data
    };
    // @ts-ignore TODO #3066 does not exist
    const result = mapUnitValues({ unit: testUnit, favoriteUnitId: 'some_id' });
    expect(isEqual(result, expectedResult)).toBe(true);
  });

  it('maps favorite unit correctly', () => {
    const expectedResult = {
      ...unit0.result,
      isFavorite: true,
      raw: unit0.data
    };
    // @ts-ignore TODO #3066 does not exist
    const result = mapUnitValues({ unit: testUnit, favoriteUnitId: testUnit.id });
    expect(isEqual(result, expectedResult)).toBe(true);
  });
});
