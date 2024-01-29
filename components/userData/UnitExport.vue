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
    :items="relevantUnits"
    :is-loading="state.isLoading"
    :handle-click="exportUnit"
  />
</template>

<script setup lang="ts">
import { Ref } from 'vue';
import { downloadZIP } from '~/lib/jsonToZip';
import { logError } from './modules/HandleError';

import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';

// Types
import { IVeoUnit } from '~/composables/api/queryDefinitions/units';

// Composables
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t } = useI18n();
const { profile } = useVeoUser();

const state = reactive({
  isLoading: [] as boolean[],
  showAlert: false,
});

const username = computed(() => profile.value?.username as string);

// Get metadata on all units
const { data: unitsMeta } = useQuery(unitQueryDefinitions.queries.fetchAll);

// Filter for relevant IDs (we want to export every unit but 'Demo')
const relevantUnits = computed(() => {
  if (!unitsMeta) return [];
  else return removeDemoUnit(unitsMeta);
});

function removeDemoUnit(units: Ref<IVeoUnit[]>) {
  if (!units) return [];
  return units.value?.filter((unit: IVeoUnit) => unit.name !== 'Demo');
}

// Export a single unit
async function exportUnit(index: number) {
  state.isLoading[index] = true;
  try {
    const unitId = relevantUnits.value[index].id;
    const unit = await useQuerySync(unitQueryDefinitions.queries.exportUnit, {
      unitId,
    });
    const fileName = `${username.value}_${unit.unit.name}`;
    await downloadZIP(unit, fileName);
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
<i18n src="./messages.json"></i18n>
