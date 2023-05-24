/*
 * verinice.veo web
 * Copyright (C) 2023 jae
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

// @vitest-environment node
import { it, describe, expect } from 'vitest';

// Functions + test data
import { chunkHistory } from '../modules/HistoryExport';
import { historyItems } from './data/historyItems';

describe('chunkHistory()', () => {
  // @ts-ignore // Typing of IVeoHistoryEntry.content might might be bit off: historyItems seems to have the wrong type, but is OK
  const result = chunkHistory(historyItems, 2);
  const firstItem = result[0];
  const lastItem = result[result.length - 1];

  it('should return objects containing veo history items', async () => {
    const requiredKeys = ['id', 'uri', 'changeNumber', 'type', 'time', 'author'];
    requiredKeys.every(key =>
      expect(Object.hasOwn(firstItem.chunk[0], key)).toBe(true)
    );
    requiredKeys.every(key =>
      expect(Object.hasOwn(lastItem.chunk[0], key)).toBe(true)
    );
  });

  it('should return objects with a correctly formatted name property', async () => {
    const expectedNameFirstItem = 'history_2022-01-21_2022-01-21';
    const expectedNameLastItem = 'history_2022-01-21_2022-01-21_2';
    expect(firstItem.name).toBe(expectedNameFirstItem);
    expect(lastItem.name).toBe(expectedNameLastItem);
  });

  it('should return objects with a correctly formatted displayName property', async () => {
    const expectedDisplayNameFirstItem = '21.01.2022 – 21.01.2022';
    const expectedDisplayNameLastItem = '21.01.2022 – 21.01.2022 (2)';
    expect(firstItem.displayName).toBe(expectedDisplayNameFirstItem);
    expect(lastItem.displayName).toBe(expectedDisplayNameLastItem);
  });
});
