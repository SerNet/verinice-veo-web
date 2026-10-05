/*
 * verinice.veo web
 * Copyright (C) 2026 Djordje Mirosavljevic
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License
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

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import taskQueryDefinitions from '~/composables/api/queryDefinitions/tasks';

describe('task query definitions', () => {
  it('serializes multiple assignees and unassigned tasks', () => {
    const result = taskQueryDefinitions.queries.fetchAll.queryParameterTransformationFn({
      domainId: 'domain-id',
      unit: 'unit-id',
      assigneeIds: ['person-1', 'person-2'],
      includeUnassigned: true,
      page: 2,
      size: 10
    });

    expect(result).toEqual({
      params: { domainId: 'domain-id' },
      query: {
        unit: 'unit-id',
        assignees: 'person-1,person-2',
        unassigned: true,
        page: 2,
        size: 10
      }
    });
  });

  it('omits assignee filters when the selection is empty', () => {
    const result = taskQueryDefinitions.queries.fetchAll.queryParameterTransformationFn({
      domainId: 'domain-id',
      unit: 'unit-id',
      assigneeIds: [],
      includeUnassigned: false
    });

    expect(result.query).toMatchObject({ unit: 'unit-id', page: 0, size: 10 });
    expect(result.query?.assignees).toBeUndefined();
    expect(result.query?.unassigned).toBeUndefined();
  });
});

describe('person query definitions', () => {
  it('passes the username used to find the current user persons', () => {
    const result = domainQueryDefinitions.queries.fetchPersonsInDomain.queryParameterTransformationFn({
      domainId: 'domain-id',
      unitId: 'unit-id',
      username: 'petra'
    });

    expect(result.query).toMatchObject({ unit: 'unit-id', username: 'petra' });
  });
});
