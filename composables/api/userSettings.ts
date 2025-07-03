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
import { computed } from 'vue';
import { useQuerySync } from './utils/query';
import settingsQueryDefinition, { IVeoUserSetting } from '~/composables/api/queryDefinitions/settings';
import messages from '~/locales/base/components/user-settings-messages.json';

export function useSettings() {
  const appId = 'verinice-veo';
  const updateSettingsMutation = useMutation(settingsQueryDefinition.mutations.updateSettings);
  const data = ref<Record<string, IVeoUserSetting> | undefined>();
  const isLoading = ref(true);
  const error = ref<TVeoError>(null);
  const { locale } = useI18n();
  const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
  const defaultSettings: Record<string, IVeoUserSetting> = {
    'compact-styles': { key: 'compact-styles', enabled: false }
  };

  async function fetchSettings() {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await useQuerySync(settingsQueryDefinition.queries.fetchSettingsWithAppId, { appId: appId });

      // Merge default settings with fetched settings
      // And normalize each setting's value
      data.value = Object.fromEntries(
        Object.entries({ ...defaultSettings, ...result }).map(([key, value]) => [
          key,
          {
            key,
            enabled: value === true || String((value as any)?.enabled ?? value).toLowerCase?.() === 'true'
          }
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
    const setting = data.value?.[key];
    setting.enabled = !setting.enabled;
  }

  // get setting by setting key
  const getSetting = (key: string): Ref<boolean> => {
    return computed(() => {
      const setting = data.value?.[key];
      return setting?.enabled ?? true;
    });
  };

  fetchSettings();

  return {
    data,
    isLoading,
    Save,
    toggleSetting,
    getSetting
  };
}
