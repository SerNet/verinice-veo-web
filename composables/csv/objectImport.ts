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

export const supportedCsvImportAttributeTypes = ['text', 'string', 'boolean'] as const;

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

export function normalizeCsvImportValue(
  value: any,
  type: CsvImportAttributeType | 'default' = 'default'
): NormalizedCsvImportValue {
  if (type === 'boolean') {
    if (isEmptyCsvImportValue(value)) return { shouldAssign: false, value: null };
    if (value === 1 || value === '1') return { shouldAssign: true, value: true };
    if (value === 0 || value === '0') return { shouldAssign: true, value: false };
    return { shouldAssign: true, value };
  }

  if (value === null || value === undefined) return { shouldAssign: true, value: '' };

  const trimmedValue = String(value).trim();
  if (trimmedValue === '' || trimmedValue === '-') return { shouldAssign: true, value: '' };

  return { shouldAssign: true, value };
}
