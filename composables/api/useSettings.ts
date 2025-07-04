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
  const updateSettingsMutation = useMutation(settingsQueryDefinition.mutations.updateSettings);
  const data = ref<Record<string, boolean> | undefined>();
  const isLoading = ref(true);
  const error = ref<TVeoError>(null);
  const { locale } = useI18n();
  const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
  const defaultSettings: Record<string, boolean> = {
    'compact-styles': false
  };

  async function fetchSettings() {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await useQuerySync(settingsQueryDefinition.queries.fetchSettingsWithAppId, { appId: appId });
      // Merge default settings with fetched settings
      data.value = Object.fromEntries(
        Object.entries({ ...defaultSettings, ...result }).map(([key, value]) => [
          key,
          value === true || String(value).toLowerCase?.() === 'true'
        ])
      );
    } catch (err) {
      error.value = handleErrorMessage(err);
      displayErrorMessage(messages?.[locale.value]?.errorBody ?? '');
    } finally {
      isLoading.value = false;
    }
  }

  // save change in setting page
  const Save = async () => {
    await updateSettingsMutation.mutateAsync({
      appId: 'verinice-veo',
      settings: data.value
    });
    displaySuccessMessage(messages?.[locale.value]?.successHeader ?? '');
  };

  // Toggle handler
  async function toggleSetting(key: string) {
    if (data.value) {
      data.value[key] = !data.value[key];
    }
  }

  fetchSettings();

  return {
    data,
    isLoading,
    Save,
    toggleSetting
  };
}
