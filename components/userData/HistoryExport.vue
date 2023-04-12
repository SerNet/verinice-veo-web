<!--
   - verinice.veo web
   - Copyright (C) 2023 jae
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
/*
<template>
  <!-- Downloads -->
  <UserDataCard
    :header="t('historyHeader')"
    :body="t('historyBody')"
    :download-btn-copy="t('btnDownload')"
    :show-alert="state.showAlert"
    :alert-header="t('alertHeader')"
    :alert-body="t('alertBody')"
    :items="state.zipArchives"
    :is-loading="state.isLoading"
    :handle-click="downloadZip"
  >
    <!-- Prepare Data -->
    <template
      v-if="state.showPrepareData"
      #prepareData
    >
      <v-btn
        color="primary"
        variant="outlined"
        class="ms-auto mt-4"
        :loading="state.isPreparing"
        @click="prepareData"
      >
        {{ t('btnPrepareDownload') }}
      </v-btn>
    </template>
  </UserDataCard>
</template>

<script setup lang="ts">
import { download } from "~~/lib/jsonToZip";
import { loadHistoryData, createZipArchives } from './modules/HistoryExport';
// import { devFetchHistoryData } from './modules/HistoryExport';
import { logError } from './modules/HandleError';
import { useRequest } from "@/composables/api/utils/request";

// Types
interface IHistoryState {
  zipArchives: { name: string; zip: Blob; }[];
  showPrepareData: boolean;
  isPreparing: boolean;
  isLoading: boolean[];
  showAlert: boolean;
}

const state: IHistoryState = reactive({
  zipArchives: [],
  isLoading: [],
  showPrepareData: true,
  isPreparing: false,
  showAlert: computed(() => state.zipArchives.length === 0 && state.showPrepareData === false)
});

// Composables
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { request } = useRequest();
const { t } = useI18n();

// HISTORY Entrypoint
async function prepareData() {
  state.isPreparing = true;
  try {
    const historyItems = await loadHistoryData({fetchFn: fetchHistoryData});
    const zipArchives = await createZipArchives(historyItems);
    state.zipArchives.push(...zipArchives);
  }
  catch (error) {
    handleError(error);
    displayErrorMessage( t('errorHeader'), t('errorBody'));
  }
  finally {
    state.showPrepareData = false;
    state.isPreparing = false;
  }
}

async function fetchHistoryData({ size = 10000, afterId = null} = {} ) {
  const queryParams = afterId ? `?size=${size}&afterId=${afterId}` : `?size=${size}`;
  const url = `/api/history/revisions/paged${queryParams}`;
  return request(url, {});
}

async function downloadZip(index: number) {
  state.isLoading[index] = true;
  try {
    download(state.zipArchives[index].zip, state.zipArchives[index].name);
    displaySuccessMessage(t('successHeader'));
  } catch (error) {
    handleError(error);
  } finally {
    state.isLoading[index] = false;
  }
}

function handleError(error: unknown) {
  logError(error);
  displayErrorMessage( t('errorHeader'), t('errorBody'));
}
</script>
<i18n src="./messages.json"></i18n>
