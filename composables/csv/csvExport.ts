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
import { format } from 'date-fns';

export type CSVField = {
  title: string;
  type: string;
  allowedValues?: string[];
};

export const getMaxRows = (fields: CSVField[]) => {
  return fields.reduce((max, f) => {
    if (f.type === 'enum') {
      return Math.max(max, f.allowedValues?.length ?? 1);
    }
    return max;
  }, 1);
};
function escapeEnumValue(value: string): string {
  return value.replace(/&/g, '\\&');
}

export const getCellValue = (field: CSVField, rowIndex: number, t?: (key: string) => string) => {
  const translate = t ?? ((key: string) => key);
  const examples: Record<string, string> = {
    text: translate('examples.text'),
    date: format(new Date(), 'yyyy-MM-dd'),
    dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    externalDocument: 'https://verinice.com',
    integer: '42',
    boolean: '0'
  };

  switch (field.type) {
    case 'boolean':
      return rowIndex === 0 ? '0' : '1';

    case 'enum':
      return field.allowedValues?.[rowIndex] ?? '';
    case 'enumList':
      return field.allowedValues?.map(escapeEnumValue).join(' & ') ?? '';

    default:
      return examples[field.type] ?? translate('examples.text');
  }
};
export const escapeCSV = (value: any) => {
  const str = String(value ?? '');
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};
export const buildRows = (fields: CSVField[], t?: (key: string) => string) => {
  const maxRows = getMaxRows(fields);
  const rows: string[][] = [];

  for (let i = 0; i < maxRows; i++) {
    rows.push(fields.map((field) => escapeCSV(getCellValue(field, i, t))));
  }

  return rows;
};
