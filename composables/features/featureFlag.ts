/*
 * verinice.veo web
 * Copyright (C) 2024 Aziz Khalledi
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
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import featureFlagsJson from './feature-flags.json';

export type FeatureFlagName = keyof typeof featureFlagsJson;
type FeatureFlags = { [key in FeatureFlagName]?: boolean };

interface CachedFeatureFlags {
  flags: FeatureFlags;
}

const featureFlags = ref<FeatureFlags>({});

export function useFeatureFlag() {
  const config = useRuntimeConfig();
  const isBetaMode = config.public.isBetaMode === 'true';

  const updateCache = () => {
    if (!isBetaMode) return;
    const cacheData: CachedFeatureFlags = { flags: featureFlags.value };
    localStorage.setItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(cacheData));
  };

  const loadEnvironmentFeatureFlags = (): FeatureFlags => {
    return ((config.public.featureFlags as { key: string; value: boolean }[]) || []).reduce<FeatureFlags>(
      (acc, flag) => {
        const featureFlagKey = Object.keys(featureFlagsJson).find((jsonKey) => jsonKey === flag.key);
        if (featureFlagKey) acc[featureFlagKey as FeatureFlagName] = flag.value;
        return acc;
      },
      {} as FeatureFlags
    );
  };

  const loadFeatureFlags = async (): Promise<FeatureFlags> => {
    try {
      return Object.entries(featureFlagsJson).reduce<FeatureFlags>((acc, [key, value]) => {
        if (!(key in featureFlags.value)) acc[key as FeatureFlagName] = value as boolean;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error loading feature flags:', error);
      return {};
    }
  };

  const loadFeatureFlagsFromCache = (): FeatureFlags => {
    if (!isBetaMode) return {};
    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS);
    if (!cachedData) return {};
    try {
      const { flags }: CachedFeatureFlags = JSON.parse(cachedData);
      return flags;
    } catch (error) {
      console.warn('Error loading cached feature flags:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS);
      return {};
    }
  };

  const resetFeatureFlags = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS);
    featureFlags.value = {};
    Object.assign(featureFlags.value, await loadFeatureFlags());
    Object.assign(featureFlags.value, loadEnvironmentFeatureFlags());
    updateCache();
  };

  const hasFeature = (flag: FeatureFlagName): boolean => {
    if (!(flag in featureFlags.value)) {
      console.warn(`Feature flag "${flag}" is not defined`);
      return false;
    }
    return !!featureFlags.value[flag];
  };

  const enableFeature = (flag: FeatureFlagName) => {
    if (!isBetaMode) return;
    featureFlags.value[flag] = true;
    updateCache();
  };

  const disableFeature = (flag: FeatureFlagName) => {
    if (!isBetaMode) return;
    featureFlags.value[flag] = false;
    updateCache();
  };

  const toggleFeature = (flag: FeatureFlagName) => {
    if (!isBetaMode) return;
    featureFlags.value[flag] = !featureFlags.value[flag];
    updateCache();
  };

  const initializeFeatureFlags = async () => {
    if (!isBetaMode) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS);
      const jsonFlags = await loadFeatureFlags();
      const envFlags = loadEnvironmentFeatureFlags();
      featureFlags.value = { ...jsonFlags, ...envFlags };
      return;
    }

    const jsonFlags = await loadFeatureFlags();
    const envFlags = loadEnvironmentFeatureFlags();
    const cacheFlags = loadFeatureFlagsFromCache();
    featureFlags.value = { ...jsonFlags, ...envFlags, ...cacheFlags };
    updateCache();
  };

  initializeFeatureFlags();

  return {
    featureFlags,
    hasFeature,
    enableFeature,
    disableFeature,
    toggleFeature,
    resetFeatureFlags,
    isBetaMode
  };
}
