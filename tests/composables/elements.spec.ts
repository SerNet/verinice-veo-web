import { describe, expect, it } from 'vitest';

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
});
