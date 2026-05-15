import { describe, expect, it } from 'vitest';
import {
  extractImportableCustomAttributes,
  isBooleanCsvImportValue,
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

  it('should normalize imported boolean values to API payload values', () => {
    expect(normalizeCsvImportValue(0, 'boolean')).toEqual({ shouldAssign: true, value: false });
    expect(normalizeCsvImportValue(1, 'boolean')).toEqual({ shouldAssign: true, value: true });
    expect(normalizeCsvImportValue('', 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('   ', 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue(null, 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue(undefined, 'boolean')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('""', 'boolean')).toEqual({ shouldAssign: true, value: '""' });
    expect(normalizeCsvImportValue('-', 'boolean')).toEqual({ shouldAssign: true, value: '-' });
  });
});
