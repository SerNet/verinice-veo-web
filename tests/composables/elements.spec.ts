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
import { describe, expect, it, vi } from 'vitest';

const { default: elementQueryDefinitions } = await import('../../composables/api/queryDefinitions/elements');

describe('elements query definitions', () => {
  it('should map hasNoParentElements="true" to hasParentElements=false', () => {
    const result = elementQueryDefinitions.queries.fetchAll.queryParameterTransformationFn({
      domain: 'test-domain',
      endpoint: 'assets',
      hasNoParentElements: 'true'
    } as any);

    expect(result.query?.hasParentElements).toBe(false);
    expect(result.query).not.toHaveProperty('hasNoParentElements');
  });

  it('invalidates tasks after updating a requirement implementation', () => {
    const invalidateQueries = vi.fn();

    elementQueryDefinitions.mutations.updateRequirementImplementation.staticMutationOptions.onSuccess(
      { invalidateQueries } as any,
      undefined,
      {} as any,
      undefined
    );

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });
});

describe('task invalidation after object mutations', () => {
  it.each(['createObject', 'updateObject', 'deleteObject'] as const)('invalidates tasks after %s', (mutation) => {
    const invalidateQueries = vi.fn();

    elementQueryDefinitions.mutations[mutation].staticMutationOptions.onSuccess(
      { invalidateQueries } as any,
      undefined as any,
      { params: { endpoint: 'assets', id: 'object-id' } } as any,
      undefined
    );

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });
});
