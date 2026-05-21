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

import { format, isValid, parse } from 'date-fns';

export const supportedCsvImportAttributeTypes = [
  'text',
  'string',
  'boolean',
  'integer',
  'externalDocument',
  'date',
  'datetime'
] as const;

export type CsvImportAttributeType = (typeof supportedCsvImportAttributeTypes)[number];

export interface CsvImportAttribute {
  key: string;
  title: string;
  customAspect: string;
  type: CsvImportAttributeType;
}

export interface NormalizedCsvImportValue {
  shouldAssign: boolean;
  value: any;
}

export function isSupportedCsvImportAttributeType(type: unknown): type is CsvImportAttributeType {
  return supportedCsvImportAttributeTypes.includes(type as CsvImportAttributeType);
}

export function extractImportableCustomAttributes(typeDef: any, translations: Record<string, string> = {}) {
  return Object.entries(typeDef?.customAspects || {}).flatMap(([customAspectKey, customAspectDef]: [string, any]) =>
    Object.entries(customAspectDef.attributeDefinitions || {})
      .filter(([_, attrDef]: [string, any]) => isSupportedCsvImportAttributeType(attrDef.type))
      .map(([attrKey, attrDef]: [string, any]) => ({
        key: attrKey,
        title: translations[attrKey] || attrKey,
        customAspect: customAspectKey,
        type: attrDef.type as CsvImportAttributeType
      }))
  );
}

export function isEmptyCsvImportValue(value: any) {
  return value === null || value === undefined || String(value).trim() === '';
}

export function isBooleanCsvImportValue(value: any) {
  if (isEmptyCsvImportValue(value)) return true;
  return ['0', '1', 0, 1].includes(value);
}

export function isIntegerCsvImportValue(value: any) {
  if (isEmptyCsvImportValue(value)) return true;
  return Number.isInteger(Number(String(value).trim()));
}
export function isLinkCsvImportValue(value: any): boolean {
  if (isEmptyCsvImportValue(value)) {
    return true;
  }
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isDateCsvImportValue(value: any) {
  if (isEmptyCsvImportValue(value)) {
    return true;
  }
  const raw = String(value).trim();
  const date = parse(raw, 'yyyy-MM-dd', new Date());

  if (!isValid(date)) {
    return false;
  }
  return format(date, 'yyyy-MM-dd') === raw;
}

export function isDateTimeCsvImportValue(value: any) {
  if (isEmptyCsvImportValue(value)) {
    return true;
  }
  const raw = String(value).trim();
  const date = parse(raw, "yyyy-MM-dd'T'HH:mm:ss", new Date());

  if (!isValid(date)) {
    return false;
  }

  return format(date, "yyyy-MM-dd'T'HH:mm:ss") === raw;
}

export function normalizeCsvImportValue(
  value: any,
  type: CsvImportAttributeType | 'default' = 'default'
): NormalizedCsvImportValue {
  if (isEmptyCsvImportValue(value)) {
    switch (type) {
      case 'boolean':
      case 'integer':
      case 'externalDocument':
      case 'date':
      case 'datetime':
        return { shouldAssign: false, value: null };

      default:
        return { shouldAssign: true, value: '' };
    }
  }

  const raw = String(value).trim();

  switch (type) {
    case 'boolean': {
      if (raw === '1') {
        return { shouldAssign: true, value: true };
      }

      if (raw === '0') {
        return { shouldAssign: true, value: false };
      }
      return { shouldAssign: false, value: null };
    }

    case 'integer':
      return isIntegerCsvImportValue(raw) ?
          { shouldAssign: true, value: Number(raw) }
        : { shouldAssign: false, value: null };
    case 'externalDocument':
      return isLinkCsvImportValue(raw) ? { shouldAssign: true, value: raw } : { shouldAssign: false, value: null };

    case 'date':
      return isDateCsvImportValue(raw) ? { shouldAssign: true, value: raw } : { shouldAssign: false, value: null };

    case 'datetime':
      return isDateTimeCsvImportValue(raw) ? { shouldAssign: true, value: raw } : { shouldAssign: false, value: null };

    default:
      return {
        shouldAssign: true,
        value: raw
      };
  }
}
