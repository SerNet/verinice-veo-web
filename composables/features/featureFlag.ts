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

const validFeatureFlagNames = ['cardView'] as const;
export type FeatureFlagName = (typeof validFeatureFlagNames)[number];
type FeatureFlags = { [key in FeatureFlagName]: boolean };

const defaultFeatureFlags: FeatureFlags = Object.fromEntries(
  validFeatureFlagNames.map((flag) => [flag, false])
) as FeatureFlags;

const isClient = typeof window !== 'undefined';
const featureFlags = ref<FeatureFlags>({ ...defaultFeatureFlags });
let isInitialized = false;

export function useFeatureFlag() {
  const config = useRuntimeConfig();
  const isBetaMode = config.public.isBetaMode === 'true';

  const updateCache = () => {
    if (!isBetaMode || !isClient) return;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(featureFlags.value));
    } catch (error) {
      console.error('Failed to update feature flags cache:', error);
    }
  };

  const loadFeatureFlagsFromCache = (): Partial<FeatureFlags> => {
    if (!isBetaMode || !isClient) return {};

    try {
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS);
      return cachedData ? JSON.parse(cachedData) : {};
    } catch (error) {
      console.warn('Error loading cached feature flags:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS);
      return {};
    }
  };

  const resetFeatureFlags = () => {
    if (!isBetaMode || !isClient) return;

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS);
      featureFlags.value = { ...defaultFeatureFlags };
    } catch (error) {
      console.error('Failed to reset feature flags:', error);
    }
  };

  const hasFeature = (flag: FeatureFlagName): boolean => {
    return featureFlags.value[flag];
  };

  const setFeature = (flag: FeatureFlagName, value: boolean) => {
    if (!isBetaMode || !validFeatureFlagNames.includes(flag)) return;

    featureFlags.value[flag] = value;
    updateCache();
  };

  const enableFeature = (flag: FeatureFlagName) => setFeature(flag, true);
  const disableFeature = (flag: FeatureFlagName) => setFeature(flag, false);

  const toggleFeature = (flag: FeatureFlagName) => {
    if (!isBetaMode) return;
    setFeature(flag, !featureFlags.value[flag]);
  };

  const initializeFeatureFlags = () => {
    if (!isBetaMode) {
      if (isClient) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.FEATURE_FLAGS);
      }
      featureFlags.value = { ...defaultFeatureFlags };
      return;
    }

    if (!isInitialized) {
      const cachedFlags = loadFeatureFlagsFromCache();

      // Merge cached flags with defaults, ensuring only valid flags are kept
      const mergedFlags = { ...defaultFeatureFlags };
      validFeatureFlagNames.forEach((flag) => {
        if (typeof cachedFlags[flag] === 'boolean') {
          mergedFlags[flag] = cachedFlags[flag];
        }
      });

      featureFlags.value = mergedFlags;
      updateCache();
      isInitialized = true;
    }
  };

  initializeFeatureFlags();

  return {
    featureFlags: readonly(featureFlags),
    hasFeature,
    enableFeature,
    disableFeature,
    toggleFeature,
    resetFeatureFlags,
    isBetaMode
  };
}
