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
import settingsQueryDefinition from '~/composables/api/queryDefinitions/settings';

export function useSettings() {
  const { data: appIds, refetch: refetchAppIds } = useQuery(settingsQueryDefinition.queries.fetchSettings);

  const appId = computed(() => (appIds.value?.includes('verinice-veo') ? 'verinice-veo' : null));
  const { data: userSettings, refetch: refetchUserSettings } = useQuery(
    settingsQueryDefinition.queries.fetchSettingsWithAppId,
    computed(() => (appId.value ? { appId: appId.value } : undefined))
  );
  const hasCompactTable = computed(() => (userSettings.value as { compact?: boolean })?.compact);
  return {
    appId,
    userSettings,
    refetchAppIds,
    refetchUserSettings,
    hasCompactTable
  };
}
