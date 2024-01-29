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
    :header="t('domainHeader')"
    :body="t('domainBody')"
    :download-btn-copy="t('btnDownload')"
    :show-alert="state.showAlert"
    :alert-header="t('alertHeader')"
    :alert-body="t('alertBody')"
    :items="state.items"
    :handle-click="exportDomainData"
    :is-loading="state.isLoading"
  />
</template>

<script setup lang="ts">
import { downloadZIP } from '~/lib/jsonToZip';
import { logError } from './modules/HandleError';
import { useQuerySync } from '~/composables/api/utils/query';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';

// Composables
const { t } = useI18n();
const { profile } = useVeoUser();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const state = reactive({
  items: [{ name: '', isLoading: false }],
  isLoading: [] as boolean[],
  showAlert: false,
});

const username = profile.value?.username;

async function exportDomainData(index: number) {
  state.isLoading[index] = true;
  try {
    const fileName = `${username}_domains`;
    const domain = await useQuerySync(
      domainQueryDefinitions.queries.fetchDomains
    );
    await downloadZIP(domain, fileName);
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
  state.items = [];
  state.showAlert = true;
}
</script>
<i18n src="./messages.json"></i18n>
