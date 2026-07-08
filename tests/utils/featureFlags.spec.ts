import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it } from 'vitest';

let featureFlags: Record<string, string> = {};

mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: {
      featureFlags
    }
  });
});

const { createFeatureFlags, hasFeature } = await import('~/utils/featureFlags');

describe('feature flags', () => {
  beforeEach(() => {
    featureFlags = {};
  });

  it('creates feature flags from environment variables and falls back to example values', () => {
    const flags = createFeatureFlags({
      VEO_FEATURE_FLAG_GRAPH: 'true',
      VEO_FEATURE_FLAG_SHORTCUTS: 'false'
    });

    expect(flags.graph).toBe('true');
    expect(flags.shortcuts).toBe('false');
    expect(flags.userSettings).toBe('VEO_FEATURE_FLAG_USER_SETTINGS_EXAMPLE');
  });

  it('only enables features when the runtime flag value is true', () => {
    featureFlags = {
      graph: 'true',
      shortcuts: 'false'
    };

    expect(hasFeature('graph')).toBe(true);
    expect(hasFeature('shortcuts')).toBe(false);
    expect(hasFeature('userSettings')).toBe(false);
  });
});
