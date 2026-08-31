/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
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
import { mdiAutorenew, mdiClipboardCheckOutline } from '@mdi/js';

import { getDeadlineColor, getTaskIcon, isTaskOverdue, parseDeadline } from '~/utils/tasks';

const NOW = new Date(2026, 7, 31); // 2026-08-31, local time

describe('parseDeadline()', () => {
  it('parses an ISO date as local midnight', () => {
    const parsed = parseDeadline('2026-08-16');

    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(7);
    expect(parsed?.getDate()).toBe(16);
    expect(parsed?.getHours()).toBe(0);
  });

  it('returns undefined for missing or malformed deadlines', () => {
    expect(parseDeadline(undefined)).toBeUndefined();
    expect(parseDeadline('')).toBeUndefined();
    expect(parseDeadline('not-a-date')).toBeUndefined();
  });
});

describe('isTaskOverdue()', () => {
  it('is true for a deadline before today', () => {
    expect(isTaskOverdue('2026-08-16', NOW)).toBe(true);
  });

  it('is false for a deadline today', () => {
    expect(isTaskOverdue('2026-08-31', NOW)).toBe(false);
  });

  it('is false for a deadline after today', () => {
    expect(isTaskOverdue('2026-09-01', NOW)).toBe(false);
  });

  it('is false without a deadline', () => {
    expect(isTaskOverdue(undefined, NOW)).toBe(false);
  });
});

describe('getDeadlineColor()', () => {
  it('is error for overdue tasks', () => {
    expect(getDeadlineColor('2026-08-16', NOW)).toBe('error');
  });

  it('is warning for tasks due today or later', () => {
    expect(getDeadlineColor('2026-08-31', NOW)).toBe('warning');
    expect(getDeadlineColor('2026-09-20', NOW)).toBe('warning');
  });
});

describe('getTaskIcon()', () => {
  it('maps implementations and revisions to distinct icons', () => {
    expect(getTaskIcon('requirement-implementation')).toBe(mdiClipboardCheckOutline);
    expect(getTaskIcon('requirement-implementation-revision')).toBe(mdiAutorenew);
  });

  it('falls back to the implementation icon for unknown types', () => {
    expect(getTaskIcon('somethingElse' as any)).toBe(mdiClipboardCheckOutline);
  });
});
