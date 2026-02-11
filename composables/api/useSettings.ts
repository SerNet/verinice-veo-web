/*
 * verinice.veo web
 * Copyright (C) 2025 Haneen Husin
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

import { useQuerySync } from './utils/query';
import settingsQueryDefinition from '~/composables/api/queryDefinitions/settings';
import messages from '~/locales/base/components/user-settings-messages.json';

const appId = 'verinice-veo';
export type ObjectPageCollapseOption = 'none' | 'form' | 'info';

const defaultSettings = {
  'compact-styles': false,
  'object-page-default-collapse': 'none' as ObjectPageCollapseOption
};

const allowedSettingKeys = Object.keys(defaultSettings);
export type UserSettings = typeof defaultSettings;
type AllowedSettingKeys = typeof allowedSettingKeys;

function filterSettings(
  allSettings: Record<string, boolean | string>,
  allowedSettingKeys: AllowedSettingKeys
): UserSettings {
  if (!allSettings || !allowedSettingKeys) return defaultSettings;

  return Object.keys(allSettings)
    .filter((key) => allowedSettingKeys.includes(key))
    .reduce((filteredSettings, key) => ({ ...filteredSettings, ...{ [key]: allSettings[key] } }), {}) as UserSettings;
}

const data = ref<UserSettings>();
const isLoading = ref(false);
const error = ref<TVeoError | undefined>();

export function useSettings() {
  const config = useRuntimeConfig();
  const updateSettingsMutation = useMutation(settingsQueryDefinition.mutations.updateSettings);
  const { locale } = useI18n();
  const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

  async function fetchSettings() {
    isLoading.value = true;
    let filteredSettings: UserSettings;

    try {
      const settings = await useQuerySync(settingsQueryDefinition.queries.fetchSettingsWithAppId, { appId });
      filteredSettings = filterSettings(settings, allowedSettingKeys);
    } catch (err) {
      error.value = err as TVeoError;
      if (config.public.debug) {
        console.error('Error fetching settings:', err);
      }
    } finally {
      isLoading.value = false;
      data.value = { ...defaultSettings, ...filteredSettings };
    }
  }

  async function saveSettings() {
    try {
      await updateSettingsMutation.mutateAsync({
        appId,
        settings: data.value
      });
      displaySuccessMessage(messages?.[locale.value]?.successHeader ?? '');
    } catch (err) {
      if (config.public.debug) {
        console.error('Error saving settings:', err);
      }
      displayErrorMessage(messages?.[locale.value]?.errorBody ?? '');
    } finally {
      isLoading.value = false;
      fetchSettings();
    }
  }

  async function toggleSetting(key: string) {
    if (data.value && typeof data.value[key] === 'boolean') {
      data.value[key] = !data.value[key];
    }
  }

  function setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    if (data.value) {
      data.value[key] = value;
    }
  }

  if (!data.value && !isLoading.value) {
    fetchSettings();
  }

  return {
    data,
    isLoading,
    save: saveSettings,
    toggleSetting,
    setSetting
  };
}
