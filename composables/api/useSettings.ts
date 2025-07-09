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

export function useSettings() {
  const appId = 'verinice-veo';
  const defaultSettings: Record<string, boolean> = {
    'compact-styles': false
  };

  const data = ref<Record<string, boolean> | undefined>();
  const isLoading = ref(true);
  const error = ref<TVeoError>();

  const config = useRuntimeConfig();
  const updateSettingsMutation = useMutation(settingsQueryDefinition.mutations.updateSettings);
  const { locale } = useI18n();
  const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

  async function fetchSettings() {
    isLoading.value = true;
    let result: Record<string, boolean> = {};

    try {
      result = await useQuerySync(settingsQueryDefinition.queries.fetchSettingsWithAppId, { appId });
    } catch (err) {
      error.value = err as TVeoError;
      if (config.public.debug) {
        console.error('Error fetching settings:', err);
      }
    } finally {
      isLoading.value = false;
      data.value = { ...defaultSettings, ...result };
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
    }
  }

  async function toggleSetting(key: string) {
    if (data.value) {
      data.value[key] = !data.value[key];
    }
  }

  fetchSettings();

  return {
    data,
    isLoading,
    save: saveSettings,
    toggleSetting
  };
}
