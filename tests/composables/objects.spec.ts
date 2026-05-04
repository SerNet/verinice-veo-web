import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';

mockNuxtImport('useRoute', () => {
  return () => ({
    params: {
      domain: 'test-domain'
    }
  });
});

const { default: objectQueryDefinitions } = await import('../../composables/api/queryDefinitions/objects');

describe('objects query definitions', () => {
  it('should map hasNoParentElements=true to hasParentElements=false', () => {
    const result = objectQueryDefinitions.queries.fetchAll.queryParameterTransformationFn({
      endpoint: 'assets',
      hasNoParentElements: true
    } as any);

    expect(result.query?.hasParentElements).toBe(false);
    expect(result.query).not.toHaveProperty('hasNoParentElements');
  });

  it('should map hasNoParentElements="true" to hasParentElements=false', () => {
    const result = objectQueryDefinitions.queries.fetchAll.queryParameterTransformationFn({
      endpoint: 'assets',
      hasNoParentElements: 'true'
    } as any);

    expect(result.query?.hasParentElements).toBe(false);
    expect(result.query).not.toHaveProperty('hasNoParentElements');
  });
});
