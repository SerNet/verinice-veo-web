/*
 * verinice.veo web
 * Copyright (C) 2026 djm , Haneen Husin
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

/*
 * verinice.veo web
 * Copyright (C) 2026 Haneen Husin
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
import { format, parse } from 'date-fns';
import { describe, expect, it } from 'vitest';
import {
  extractImportableCustomAttributes,
  isBooleanCsvImportValue,
  isDateCsvImportValue,
  isDateTimeCsvImportValue,
  isIntegerCsvImportValue,
  isLinkCsvImportValue,
  isValidEnumValue,
  isValidEnumListValue,
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
            asset_meta_rank: { type: 'integer' },
            asset_meta_webSite: { type: 'externalDocument' }
          }
        }
      }
    };

    const attributes = extractImportableCustomAttributes(typeDef, {
      asset_meta_name: 'Name',
      asset_meta_enabled: 'Enabled',
      asset_meta_rank: 'Rank',
      asset_meta_webSite: 'webSite'
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
      },
      {
        key: 'asset_meta_webSite',
        title: 'webSite',
        customAspect: 'asset_meta',
        type: 'externalDocument'
      }
    ]);
  });
  const expected = format(
    parse('2026-02-28T13:13:30', "yyyy-MM-dd'T'HH:mm:ss", new Date()),
    "yyyy-MM-dd'T'HH:mm:ssxxx"
  );
  const allowedValues = [
    'incident_description_locationOfIncident_inside',
    'incident_description_locationOfIncident_outside'
  ];
  const translations = {
    incident_description_locationOfIncident_inside: 'Inside organization',
    incident_description_locationOfIncident_outside: 'outside organization'
  };
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

    expect(normalizeCsvImportValue('https://test', 'externalDocument')).toEqual({
      shouldAssign: true,
      value: 'https://test'
    });
    expect(normalizeCsvImportValue('', 'externalDocument')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('   ', 'externalDocument')).toEqual({ shouldAssign: false, value: null });

    expect(normalizeCsvImportValue('2026-02-28', 'date')).toEqual({ shouldAssign: true, value: '2026-02-28' });
    expect(normalizeCsvImportValue('2026-02-29', 'date')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('', 'date')).toEqual({ shouldAssign: false, value: null });

    expect(normalizeCsvImportValue('2026-02-28T13:13:30', 'dateTime')).toEqual({
      shouldAssign: true,
      value: expected
    });
    expect(normalizeCsvImportValue('2026-02-28T13:77:30', 'dateTime')).toEqual({ shouldAssign: false, value: null });
    expect(normalizeCsvImportValue('', 'dateTime')).toEqual({ shouldAssign: false, value: null });

    expect(normalizeCsvImportValue('Inside organization', 'enum', allowedValues, translations)).toEqual({
      shouldAssign: true,
      value: 'incident_description_locationOfIncident_inside'
    });
    expect(normalizeCsvImportValue('Invalid', 'enum', allowedValues, translations)).toEqual({
      shouldAssign: false,
      value: null
    });
    expect(normalizeCsvImportValue('', 'enum', allowedValues, translations)).toEqual({
      shouldAssign: false,
      value: null
    });
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
  it('should normalize URL values correctly', () => {
    expect(isLinkCsvImportValue('https://test')).toBe(true);
    expect(isLinkCsvImportValue('http://localhost')).toBe(true);

    expect(isLinkCsvImportValue('')).toBe(true);
    expect(isLinkCsvImportValue('   ')).toBe(true);
    expect(isLinkCsvImportValue(null)).toBe(true);
    expect(isLinkCsvImportValue(undefined)).toBe(true);

    expect(isLinkCsvImportValue('No-URL')).toBe(false);
    expect(isLinkCsvImportValue('http')).toBe(false);
    expect(isLinkCsvImportValue('""')).toBe(false);
  });

  it('should validate Date values correctly', () => {
    expect(isDateCsvImportValue('2026-02-28')).toBe(true);
    expect(isDateCsvImportValue('2026-02-29')).toBe(false);
    expect(isDateCsvImportValue('2026-13-01')).toBe(false);
    expect(isDateCsvImportValue('')).toBe(true);
    expect(isDateCsvImportValue('   ')).toBe(true);
    expect(isDateCsvImportValue(null)).toBe(true);
  });
  it('should validate DateTime values correctly', () => {
    expect(isDateTimeCsvImportValue('2026-02-28T13:13:30')).toBe(true);
    expect(isDateTimeCsvImportValue('2026-02-28T13:77:30')).toBe(false);
    expect(isDateTimeCsvImportValue('2026-02-28 13:13:30')).toBe(false);
    expect(isDateTimeCsvImportValue('')).toBe(true);
    expect(isDateTimeCsvImportValue('   ')).toBe(true);
    expect(isDateTimeCsvImportValue(null)).toBe(true);
  });
  it('should normalize enum values correctly', () => {
    expect(isValidEnumValue('Inside organization', allowedValues, translations)).toBe(true);
    expect(isValidEnumValue('Outside organization', allowedValues, translations)).toBe(true);
    expect(isValidEnumValue('', allowedValues, translations)).toBe(true);
    expect(isValidEnumValue('   ', allowedValues, translations)).toBe(true);
    expect(isValidEnumValue(null, allowedValues, translations)).toBe(true);
    expect(isValidEnumValue('Invalid', allowedValues, translations)).toBe(false);
    expect(isValidEnumValue('""', allowedValues, translations)).toBe(false);
  });

  const listAllowedValues = [
    'person_preferences_favColor_green',
    'person_preferences_favColor_red',
    'person_preferences_favColor_blue'
  ];
  const listTranslations = {
    person_preferences_favColor_green: 'Grün',
    person_preferences_favColor_red: 'Rot',
    person_preferences_favColor_blue: 'Blau'
  };

  it('includes multi-select (list of enum) attributes and excludes unsupported list item types from mapping', () => {
    const typeDef = {
      customAspects: {
        person_preferences: {
          attributeDefinitions: {
            person_preferences_favColor: {
              type: 'list',
              itemDefinition: { type: 'enum', allowedValues: listAllowedValues }
            },
            person_preferences_tags: {
              type: 'list',
              itemDefinition: { type: 'text' }
            }
          }
        }
      }
    };

    const attributes = extractImportableCustomAttributes(typeDef, {
      person_preferences_favColor: 'Favorite colors',
      person_preferences_tags: 'Tags'
    });

    expect(attributes).toEqual([
      {
        key: 'person_preferences_favColor',
        title: 'Favorite colors',
        customAspect: 'person_preferences',
        type: 'enumList',
        allowedValues: listAllowedValues
      }
    ]);
  });

  it('should normalize multi-select enum-list values correctly', () => {
    expect(normalizeCsvImportValue('Grün,Rot', 'enumList', listAllowedValues, listTranslations)).toEqual({
      shouldAssign: true,
      value: ['person_preferences_favColor_green', 'person_preferences_favColor_red']
    });
    expect(normalizeCsvImportValue(' Grün , Rot ', 'enumList', listAllowedValues, listTranslations)).toEqual({
      shouldAssign: true,
      value: ['person_preferences_favColor_green', 'person_preferences_favColor_red']
    });
    expect(normalizeCsvImportValue('Grün,Grün', 'enumList', listAllowedValues, listTranslations)).toEqual({
      shouldAssign: true,
      value: ['person_preferences_favColor_green']
    });
    expect(normalizeCsvImportValue('Grü,Rot', 'enumList', listAllowedValues, listTranslations)).toEqual({
      shouldAssign: false,
      value: null
    });
    expect(normalizeCsvImportValue('', 'enumList', listAllowedValues, listTranslations)).toEqual({
      shouldAssign: false,
      value: null
    });
    expect(normalizeCsvImportValue('   ', 'enumList', listAllowedValues, listTranslations)).toEqual({
      shouldAssign: false,
      value: null
    });
    expect(normalizeCsvImportValue(null, 'enumList', listAllowedValues, listTranslations)).toEqual({
      shouldAssign: false,
      value: null
    });
    expect(normalizeCsvImportValue('Grün,', 'enumList', listAllowedValues, listTranslations)).toEqual({
      shouldAssign: true,
      value: ['person_preferences_favColor_green']
    });
  });

  it('should validate multi-select enum-list values correctly', () => {
    expect(isValidEnumListValue('Grün,Rot', listAllowedValues, listTranslations)).toBe(true);
    expect(isValidEnumListValue(' Grün , Rot ', listAllowedValues, listTranslations)).toBe(true);
    expect(isValidEnumListValue('', listAllowedValues, listTranslations)).toBe(true);
    expect(isValidEnumListValue('   ', listAllowedValues, listTranslations)).toBe(true);
    expect(isValidEnumListValue(null, listAllowedValues, listTranslations)).toBe(true);
    expect(isValidEnumListValue('Grü,Rot', listAllowedValues, listTranslations)).toBe(false);
    expect(isValidEnumListValue('Grün,Invalid', listAllowedValues, listTranslations)).toBe(false);
  });
});
