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
