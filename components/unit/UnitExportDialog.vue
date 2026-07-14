<!--
   - verinice.veo web
   - Copyright (C) 2026 sernet
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
  <!-- @vue-ignore TODO #3066 not assignable -->
  <BaseDialog
    :model-value="props.modelValue"
    v-bind="$attrs"
    data-veo-test="units-export-dialog"
    :aria-label="t('dialogTitle')"
    :title="t('dialogTitle')"
    :close-function="closeDialog"
    :close-disabled="isExporting"
    width="600px"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <div class="text-pre-wrap">
        {{ t('description', { name: props.unit?.name }) }}
      </div>

      <BaseAlert
        :model-value="true"
        :buttons="[{ text: t('dataTransfer'), onClick: navigateToUserData }]"
        :title="t('dataTransfer')"
        :type="VeoAlertType.INFO"
        class="mt-4"
        flat
        no-close-button
      >
        {{ t('dataTransferHint') }}
      </BaseAlert>
    </template>

    <template #dialog-options>
      <v-btn variant="text" @click="closeDialog">
        {{ globalT('global.button.cancel') }}
      </v-btn>

      <v-spacer />

      <v-btn
        variant="text"
        color="primary"
        data-veo-test="units-export-dialog-btn-export"
        :loading="isExporting"
        :disabled="isExporting"
        @click="confirmExport"
      >
        {{ t('export') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { VeoAlertType } from '~/types/VeoTypes';
import type { TVeoUnit } from '~/composables/requests/useUnits';
import { logError } from '../userData/modules/HandleError';

interface Props {
  modelValue: boolean;
  unit?: TVeoUnit;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:model-value': [value: boolean];
}>();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const { exportUnit } = useUnitExport();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const isExporting = ref(false);

function closeDialog() {
  emit('update:model-value', false);
}

async function confirmExport() {
  const id = props.unit?.id;
  if (!id || isExporting.value) return;

  isExporting.value = true;

  try {
    await exportUnit(id);
    displaySuccessMessage(t('successHeader'));
    closeDialog();
  } catch (error) {
    handleError(error);
  } finally {
    isExporting.value = false;
  }
}

function handleError(error: unknown) {
  logError(error);
  displayErrorMessage(t('errorHeader'), t('errorBody'));
}

function navigateToUserData() {
  navigateTo('/user-data');
}
</script>

<i18n src="~/locales/base/components/unit-export-dialog.json"></i18n>
