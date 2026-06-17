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

import { describe, it, expect, afterEach } from 'vitest';
import { vi } from 'vitest';
import { buildRows, escapeCSV, getCellValue, getMaxRows } from '~/composables/csv/csvExport';

describe('getMaxRows', () => {
  it('returns 1 when no enum fields', () => {
    expect(getMaxRows([{ title: 'a', type: 'text' }])).toBe(1);
  });

  it('returns max enum size', () => {
    expect(
      getMaxRows([
        { title: 'a', type: 'enum', allowedValues: ['1', '2'] },
        { title: 'b', type: 'enum', allowedValues: ['x', 'y', 'z'] }
      ])
    ).toBe(3);
  });
});

describe('escapeCSV', () => {
  it('escapes comma', () => {
    expect(escapeCSV('a,b')).toBe('"a,b"');
  });

  it('escapes quotes', () => {
    expect(escapeCSV('a"b')).toBe('"a""b"');
  });

  it('keeps normal string', () => {
    expect(escapeCSV('abc')).toBe('abc');
  });
});

describe('getCellValue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it('boolean type returns 0/1', () => {
    expect(getCellValue({ title: 'x', type: 'boolean' }, 0)).toBe('0');
    expect(getCellValue({ title: 'x', type: 'boolean' }, 1)).toBe('1');
  });

  it('enum returns correct index value', () => {
    expect(getCellValue({ title: 'x', type: 'enum', allowedValues: ['A', 'B'] }, 1)).toBe('B');
  });

  it('enumList joins values', () => {
    expect(getCellValue({ title: 'x', type: 'enumList', allowedValues: ['A', 'B'] }, 0)).toBe('A, B');
  });
  it('returns formatted date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-20'));

    expect(getCellValue({ title: 'x', type: 'date' }, 0)).toBe('2026-06-20');
  });

  it('returns formatted datetime', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-20T15:30:55'));

    expect(getCellValue({ title: 'x', type: 'dateTime' }, 0)).toBe('2026-06-20T15:30:55');
  });

  it('default uses example values', () => {
    expect(getCellValue({ title: 'x', type: 'text' }, 0)).toBe('examples.text');
  });
});

describe('buildRows', () => {
  it('builds correct row structure', () => {
    const fields = [
      { title: 'A', type: 'text' },
      { title: 'B', type: 'boolean' }
    ];
    const rows = buildRows(fields);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].length).toBe(2);
  });
});
