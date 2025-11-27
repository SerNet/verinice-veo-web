<!--
   - verinice.veo web
   - Copyright (C) 2023  jae
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <UserDataCard
    :header="t('unitHeader')"
    :download-btn-copy="t('btnDownload')"
    :show-alert="state.showAlert"
    :alert-header="t('alertHeader')"
    :alert-body="t('alertBody')"
    :items="units"
    :is-loading="state.isLoading"
    :handle-click="exportUnit"
  />
</template>

<script setup lang="ts">
import { downloadZIP } from '~/lib/jsonToZip';
import { logError } from './modules/HandleError';

// Composables
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t } = useI18n();
const { profile } = useVeoUser();

const state = reactive({
  isLoading: [] as boolean[],
  showAlert: false
});

const username = computed(() => profile.value?.username as string);
const { data: units } = useUnits();

const id = ref();
const { data: unit, isFetching: isFetchingUnit } = useUnit(id);

async function exportUnit(index: number) {
  state.isLoading[index] = true;
  try {
    id.value = units.value[index].id;
    await waitForBooleanToUpdate(isFetchingUnit, false);

    const fileName = `${username.value}_${unit.value.name}`;
    await downloadZIP(unit.value, fileName);
    displaySuccessMessage(t('successHeader'));
  } catch (error) {
    handleError(error);
  } finally {
    state.isLoading[index] = false;
  }
}

function handleError(error: unknown) {
  logError(error);
  displayErrorMessage(t('errorHeader'), t('errorBody'));
}
</script>

<i18n src="~/locales/base/components/user-data-messages.json"></i18n>
