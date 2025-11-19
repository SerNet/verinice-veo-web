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
    <template v-if="state.prepare.phase !== PrepPhase.Done" #prepareData>
      <div class="d-flex align-center ms-auto mt-4">
        <div
          v-if="state.prepare.phase === PrepPhase.Zip || state.prepare.phase === PrepPhase.Download"
          class="text-subtitle-1 text-primary me-4"
        >
          <span>{{ t(`prepareHistoryPhases.${state.prepare?.phase}`) }}</span>
          <span class="font-weight-black" style="display: inline-block; width: 48px"
            >&nbsp;{{ Math.floor(progressBar) }}&nbsp;%</span
          >
        </div>
        <v-btn
          color="primary"
          variant="outlined"
          :loading="state.prepare.phase !== PrepPhase.Idle"
          @click="prepareData"
        >
          {{ t('btnPrepareDownload') }}

          <template #loader>
            <v-progress-linear :model-value="progressBar" />
          </template>
        </v-btn>
      </div>
    </template>
  </UserDataCard>

  <!-- On leaving this route: warn user if data preparation in progress -->
  <BaseDialog
    :close-function="toggleWarnOnLeaveDialog"
    :model-value="state.warnOnLeave"
    :title="t('alertLeavePageTitle')"
  >
    <template #default>
      <v-card-text>
        {{ t('alertLeavePageCopy') }}
      </v-card-text>
    </template>

    <template #dialog-options>
      <v-btn flat variant="plain" class="me-2" @click="confirmPageLeave(false)">
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn flat color="primary" @click="confirmPageLeave(true)">
        {{ t('global.button.ok') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { download } from '~/lib/jsonToZip';
import { loadHistory, chunkHistory, createZipArchives } from './modules/HistoryExport';
import { logError } from './modules/HandleError';
import { useQuerySync } from '~/composables/api/utils/query';
import historyQueryDefinitions from '~/composables/api/queryDefinitions/history';

// Types
import type { HistoryZipArchive } from './modules/HistoryExport';
import { PrepPhase } from './modules/HistoryExport';

interface IHistoryState {
  zipArchives: HistoryZipArchive[];
  isLoading: boolean[];
  showAlert: boolean;
  prepare: {
    phase: PrepPhase;
    currentPercentage: number;
    totalPercentage: number;
  };
  warnOnLeave: boolean;
  resolveWarnOnLeave: any;
}

// Composables
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t } = useI18n();

// State
const state: IHistoryState = reactive({
  zipArchives: [],
  isLoading: [],
  showAlert: computed(() => state.zipArchives.length === 0 && state.prepare.phase === PrepPhase.Done),
  prepare: {
    phase: PrepPhase.Idle,
    currentPercentage: 0,
    totalPercentage: 100
  },
  warnOnLeave: false,
  resolveWarnOnLeave: undefined
});

function updateLoadingState({
  phase,
  currentPercentage,
  totalPercentage
}: {
  phase: PrepPhase;
  currentPercentage: number;
  totalPercentage: number;
}) {
  state.prepare = { phase, currentPercentage, totalPercentage };
}

const progressBar = computed(() =>
  state?.prepare?.currentPercentage && state?.prepare?.totalPercentage ?
    (state?.prepare?.currentPercentage / state?.prepare?.totalPercentage) * 100
  : 0
);

// HISTORY Entrypoint
async function prepareData() {
  state.prepare.phase = PrepPhase.Download;
  try {
    const history = await loadHistory({
      updateLoadingState,
      fetchFn: fetchHistoryData,
      size: 5000
    });
    const chunkedHistory = chunkHistory(history);
    const zipArchives = await createZipArchives(updateLoadingState, chunkedHistory);
    state.zipArchives.push(...zipArchives);
  } catch (error) {
    handleError(error);
    displayErrorMessage(t('errorHeader'), t('errorBody'));
  } finally {
    state.prepare.phase = PrepPhase.Done;
  }
}

async function fetchHistoryData({ size = 10000, afterId }: { size?: number; afterId?: string | undefined } = {}) {
  return useQuerySync(historyQueryDefinitions.queries.fetchPagedRevisions, {
    size: size.toString(),
    afterId
  });
}

async function downloadZip(index: number) {
  state.isLoading[index] = true;
  try {
    download(state.zipArchives[index].zip, state.zipArchives[index].fileName);
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

/***************************
 * Warn before leaving page
 ***************************/
const toggleWarnOnLeaveDialog = () => (state.warnOnLeave = !state.warnOnLeave);

function askForConfirmation() {
  toggleWarnOnLeaveDialog();
  return new Promise((resolve) => {
    state.resolveWarnOnLeave = resolve;
  });
}

function confirmPageLeave(isLeaving: boolean) {
  state.resolveWarnOnLeave(isLeaving);
  toggleWarnOnLeaveDialog();
}

onBeforeRouteLeave((to, from, next) => {
  // Prompt user if download in progress
  if (state.prepare.phase === PrepPhase.Download || state.prepare.phase === PrepPhase.Zip) {
    askForConfirmation().then((isLeaving) => {
      if (isLeaving) next();
    });
    return;
  }
  next();
});
</script>

<i18n src="~/locales/base/components/user-data-messages.json"></i18n>
