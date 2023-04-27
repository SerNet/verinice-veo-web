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
      v-if="state.prepare.phase !== PrepPhase.Done"
      #prepareData
    >
      <div class="d-flex align-center ms-auto mt-4">
        <div
          v-if="state.prepare.phase === PrepPhase.Zip || state.prepare.phase === PrepPhase.Download"
          class="text-subtitle-1  text-primary me-4"
        >
          <span>{{ t(`prepareHistoryPhases.${state.prepare?.phase}`) }}</span>
          <span
            class="font-weight-black"
            style="display: inline-block; width: 48px"
          >&nbsp;{{ Math.floor(progressBar) }}&nbsp;%</span>
        </div>
        <v-btn
          color="primary"
          variant="outlined"
          :loading="state.prepare.phase !== PrepPhase.Idle"
          @click="prepareData"
        >
          {{ t('btnPrepareDownload') }}

          <template #loader>
            <v-progress-linear
              :model-value="progressBar"
            />
          </template>
        </v-btn>
      </div>
    </template>
  </UserDataCard>
</template>

<script setup lang="ts">
import { download } from "~~/lib/jsonToZip";
import { loadHistory, chunkHistory, createZipArchives } from './modules/HistoryExport';
import { logError } from './modules/HandleError';
import { useRequest } from "@/composables/api/utils/request";

// Types
import {
  FetchFnParams,
  FetchFnResult,
  HistoryZipArchive,
  PrepPhase
} from './modules/HistoryExport';

interface IHistoryState {
  zipArchives: HistoryZipArchive[];
  isLoading: boolean[];
  showAlert: boolean;
  prepare: { phase: PrepPhase, cur: number, total: number };
}

// Composables
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { request } = useRequest();
const { t } = useI18n();

// State
const state: IHistoryState = reactive({
  zipArchives: [],
  isLoading: [],
  showAlert: computed(() => state.zipArchives.length === 0 && state.showPrepareData === false),
  prepare: { phase: PrepPhase.Idle,  cur: 1, total: 100 }
});

function updateLoadingState({ phase, cur, total }: { phase: PrepPhase, cur: number, total: number}) {
  state.prepare = { phase, cur, total };
}

const progressBar = computed(() =>
  (state?.prepare?.cur && state?.prepare?.total) ? state?.prepare?.cur / state?.prepare?.total * 100 : 3);

// HISTORY Entrypoint
async function prepareData() {
  state.prepare.phase = PrepPhase.Download;
  try {
    const history = await loadHistory({ updateLoadingState, fetchFn: fetchHistoryData });
    const chunkedHistory = chunkHistory(history);
    const zipArchives = await createZipArchives(updateLoadingState, chunkedHistory);
    state.zipArchives.push(...zipArchives);
  }
  catch (error) {
    handleError(error);
    displayErrorMessage( t('errorHeader'), t('errorBody'));
  }
  finally {
    state.prepare.phase = PrepPhase.Done;
  }
}

async function fetchHistoryData({ size = 10000, afterId = null}: FetchFnParams ): Promise<FetchFnResult> {
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
