/*
 * verinice.veo web
 * Copyright (C) 2026 djm
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

import { describe, expect, it } from 'vitest';
import {
  extractImportableCustomAttributes,
  isBooleanCsvImportValue,
  isIntegerCsvImportValue,
  normalizeCsvImportValue
} from '~/composables/csv/objectImport';

describe('object CSV import helpers', () => {
  it('includes boolean attributes and excludes unsupported attribute types from mapping', () => {
    const typeDef = {
      customAspects: {
        asset_meta: {
          attributeDefinitions: {
            asset_meta_name: { type: 'string' },
            asset_meta_enabled: { type: 'boolean' },
            asset_meta_rank: { type: 'integer' }
          }
        }
      }
    };

    const attributes = extractImportableCustomAttributes(typeDef, {
      asset_meta_name: 'Name',
      asset_meta_enabled: 'Enabled',
      asset_meta_rank: 'Rank'
    });

    expect(attributes).toEqual([
      {
        key: 'asset_meta_name',
        title: 'Name',
        customAspect: 'asset_meta',
        type: 'string'
      },
      {
        key: 'asset_meta_enabled',
        title: 'Enabled',
        customAspect: 'asset_meta',
        type: 'boolean'
      },
      {
        key: 'asset_meta_rank',
        title: 'Rank',
        customAspect: 'asset_meta',
        type: 'integer'
      }
    ]);
  });

  it('should accept only 0, 1, or empty values for boolean imports', () => {
    expect(isBooleanCsvImportValue(0)).toBe(true);
    expect(isBooleanCsvImportValue(1)).toBe(true);
    expect(isBooleanCsvImportValue('0')).toBe(true);
    expect(isBooleanCsvImportValue('1')).toBe(true);
    expect(isBooleanCsvImportValue('')).toBe(true);
    expect(isBooleanCsvImportValue('   ')).toBe(true);
    expect(isBooleanCsvImportValue(null)).toBe(true);
    expect(isBooleanCsvImportValue(undefined)).toBe(true);
    expect(isBooleanCsvImportValue('ja')).toBe(false);
    expect(isBooleanCsvImportValue('""')).toBe(false);
    expect(isBooleanCsvImportValue('-')).toBe(false);
    expect(isBooleanCsvImportValue(true)).toBe(false);
    expect(isBooleanCsvImportValue(false)).toBe(false);
  });

  it('should normalize imported values to API payload values', () => {
    expect(normalizeCsvImportValue(0, 'boolean')).toEqual({ shouldAssign: true, value: false });
    expect(normalizeCsvImportValue(1, 'boolean')).toEqual({ shouldAssign: true, value: true });
    expect(normalizeCsvImportValue('', 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('   ', 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue(null, 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue(undefined, 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('""', 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('-', 'boolean')).toEqual({ shouldAssign: false, value: null });

    expect(normalizeCsvImportValue(5, 'integer')).toEqual({ shouldAssign: true, value: 5 });
    expect(normalizeCsvImportValue('5', 'integer')).toEqual({ shouldAssign: true, value: 5 });
    expect(normalizeCsvImportValue('5.5', 'integer')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('', 'integer')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('   ', 'integer')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue(null, 'integer')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue(undefined, 'integer')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('-', 'integer')).toEqual({ shouldAssign: false, value: null });
  });

  it('should accept only integer imports or empty values', () => {
    expect(isIntegerCsvImportValue(5)).toBe(true);
    expect(isIntegerCsvImportValue('5')).toBe(true);
    expect(isIntegerCsvImportValue('5.5')).toBe(false);
    expect(isIntegerCsvImportValue('integer')).toBe(false);
    expect(isIntegerCsvImportValue('')).toBe(true);
    expect(isIntegerCsvImportValue('   ')).toBe(true);
    expect(isIntegerCsvImportValue(null)).toBe(true);
  });
});
