<!--
   - verinice.veo web
   - Copyright (C) 2025 Haneen Husin
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <UserSettingsCard :items="settingsList" :handle-click="toggleSetting" />
  <div class="d-flex justify-end">
    <v-btn color="primary" @click="handleSave">
      {{ t('save') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import settingsQueryDefinition, { IVeoUserSetting } from '~/composables/api/queryDefinitions/settings';
import { logError } from '../userData/modules/HandleError';
import { useMutation } from '~/composables/api/utils/mutation';

const { t } = useI18n();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const { userSettings, refetchAppIds, refetchUserSettings } = useSettings();
const updateSettingsMutation = useMutation(settingsQueryDefinition.mutations.updateSettings);

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

async function handleSave() {
  try {
    await updateSettingsMutation.mutateAsync({
      appId: 'verinice-veo',
      settings: state.settings
    });
    handleSuccess();
  } catch (error) {
    handleError(error);
  }
}

function handleError(error: unknown) {
  logError(error);
  displayErrorMessage(t('errorHeader'), t('errorBody'));
}
async function handleSuccess() {
  await refetchAppIds();
  refetchUserSettings();
  displaySuccessMessage(t('successHeader'));
}
</script>

<i18n src="~/locales/base/components/user-settings-messages.json"></i18n>
