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
import { useQuery } from './utils/query';
import settingsQueryDefinition, { IVeoUserSetting } from '~/composables/api/queryDefinitions/settings';

export function useSettings() {
  const { data: appIds, refetch: refetchAppIds } = useQuery(settingsQueryDefinition.queries.fetchSettings);
  const updateSettingsMutation = useMutation(settingsQueryDefinition.mutations.updateSettings);
  const appId = computed(() => (appIds.value?.includes('verinice-veo') ? 'verinice-veo' : null));
  const {
    data: userSettings,
    refetch: refetchUserSettings,
    isLoading: isLoadingUserSettings
  } = useQuery(
    settingsQueryDefinition.queries.fetchSettingsWithAppId,
    computed(() => (appId.value ? { appId: appId.value } : undefined))
  );
  const saveUserSettings = async () => {
    await updateSettingsMutation.mutateAsync({
      appId: 'verinice-veo',
      settings: state.settings
    });
    refetchAppIds();
    refetchUserSettings();
  };

  // Reactive state
  const state = reactive({
    settings: {} as Record<string, IVeoUserSetting>
  });

  const defaultSettings: Record<string, IVeoUserSetting> = {
    'compact-styles': { key: 'compact-styles', enabled: false }
  };

  // Watch and sync settings
  watchEffect(() => {
    const fetched = userSettings.value || {};
    state.settings = Object.fromEntries(
      Object.entries({ ...defaultSettings, ...fetched }).map(([key, value]) => [
        key,
        { key, enabled: value === true || String(value).toLowerCase() === 'true' }
      ])
    );
  });

  const settingsList = computed(() => Object.values(state.settings));

  // Toggle handler
  async function toggleSetting(key: string, enabled: boolean) {
    state.settings[key].enabled = enabled;
  }
  const getSetting = (key: string): Ref<boolean> => {
    return computed(() => userSettings.value?.[key] ?? true);
  };
  return {
    settingsList,
    getSetting,
    isLoadingUserSettings,
    toggleSetting,
    saveUserSettings
  };
}
