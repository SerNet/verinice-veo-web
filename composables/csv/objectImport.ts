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
  'dateTime',
  'enum',
  'enumList'
] as const;

export type CsvImportAttributeType = (typeof supportedCsvImportAttributeTypes)[number];

export interface CsvImportAttribute {
  key: string;
  title: string;
  customAspect: string;
  type: CsvImportAttributeType;
  allowedValues?: string[];
}

export interface NormalizedCsvImportValue {
  shouldAssign: boolean;
  value: any;
}

export function isSupportedCsvImportAttributeType(type: unknown): type is CsvImportAttributeType {
  return supportedCsvImportAttributeTypes.includes(type as CsvImportAttributeType);
}

function resolveImportAttributeType(attrDef: any): { type: CsvImportAttributeType; allowedValues?: string[] } | null {
  if (attrDef?.type === 'list') {
    if (attrDef.itemDefinition?.type === 'enum') {
      return { type: 'enumList', allowedValues: attrDef.itemDefinition.allowedValues };
    }
    return null;
  }

  if (!isSupportedCsvImportAttributeType(attrDef?.type)) {
    return null;
  }

  if (attrDef.type === 'enum' && attrDef.allowedValues) {
    return { type: 'enum', allowedValues: attrDef.allowedValues };
  }

  return { type: attrDef.type as CsvImportAttributeType };
}

export function extractImportableCustomAttributes(typeDef: any, translations: Record<string, string> = {}) {
  return Object.entries(typeDef?.customAspects || {}).flatMap(([customAspectKey, customAspectDef]: [string, any]) =>
    Object.entries(customAspectDef.attributeDefinitions || {})
      .map(([attrKey, attrDef]: [string, any]) => {
        const resolved = resolveImportAttributeType(attrDef);
        if (!resolved) {
          return null;
        }

        const attribute: CsvImportAttribute = {
          key: attrKey,
          title: translations[attrKey] || attrKey,
          customAspect: customAspectKey,
          type: resolved.type
        };
        if (resolved.allowedValues) {
          attribute.allowedValues = resolved.allowedValues;
        }

        return attribute;
      })
      .filter((attribute): attribute is CsvImportAttribute => attribute !== null)
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

function matchEnumKey(value: string, allowedValues: string[], translations: Record<string, string>): string | null {
  const raw = value.trim().toLowerCase();
  return (
    allowedValues.find(
      (key) =>
        String(translations[key] ?? '')
          .trim()
          .toLowerCase() === raw
    ) ?? null
  );
}

function splitEnumListValue(value: any): string[] {
  return String(value)
    .split(',')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

export function isValidEnumValue(value: any, allowedValues: string[], translations: Record<string, string>): boolean {
  if (isEmptyCsvImportValue(value)) {
    return true;
  }

  return matchEnumKey(String(value), allowedValues, translations) !== null;
}

export function isValidEnumListValue(
  value: any,
  allowedValues: string[],
  translations: Record<string, string>
): boolean {
  if (isEmptyCsvImportValue(value)) {
    return true;
  }

  const segments = splitEnumListValue(value);
  if (segments.length === 0) {
    return true;
  }

  return segments.every((segment) => matchEnumKey(segment, allowedValues, translations) !== null);
}
export function normalizeCsvImportValue(
  value: any,
  type: CsvImportAttributeType | 'default' = 'default',
  allowedValues?: string[],
  translations?: Record<string, string>
): NormalizedCsvImportValue {
  if (isEmptyCsvImportValue(value)) {
    switch (type) {
      case 'boolean':
      case 'integer':
      case 'externalDocument':
      case 'date':
      case 'dateTime':
      case 'enum':
      case 'enumList':
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

    case 'dateTime': {
      if (!isDateTimeCsvImportValue(raw)) {
        return { shouldAssign: false, value: null };
      }
      const dateTime = parse(raw, "yyyy-MM-dd'T'HH:mm:ss", new Date());

      return {
        shouldAssign: true,
        value: format(dateTime, "yyyy-MM-dd'T'HH:mm:ssxxx")
      };
    }

    case 'enum': {
      if (!allowedValues || !translations) {
        return { shouldAssign: false, value: null };
      }
      const matchedKey = matchEnumKey(raw, allowedValues, translations);

      if (!matchedKey) {
        return { shouldAssign: false, value: null };
      }

      return { shouldAssign: true, value: matchedKey };
    }

    case 'enumList': {
      if (!allowedValues || !translations) {
        return { shouldAssign: false, value: null };
      }

      const segments = splitEnumListValue(raw);
      if (segments.length === 0) {
        return { shouldAssign: false, value: null };
      }

      const keys: string[] = [];
      for (const segment of segments) {
        const matchedKey = matchEnumKey(segment, allowedValues, translations);
        if (!matchedKey) {
          return { shouldAssign: false, value: null };
        }
        if (!keys.includes(matchedKey)) {
          keys.push(matchedKey);
        }
      }

      return { shouldAssign: true, value: keys };
    }

    default:
      return {
        shouldAssign: true,
        value: raw
      };
  }
}
