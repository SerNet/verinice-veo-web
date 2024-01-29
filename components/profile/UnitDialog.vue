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
  <BaseDialog
    :model-value="state.showDialog"
    :title="t('unitSelectionTitle')"
    :close-function="toggleDialog"
    @keydown.enter="apply"
  >
    <template #default>
      <BaseCard>
        <v-card-text>
          <v-icon :icon="mdiFilePlusOutline" size="x-large" start />
          {{ t('unitSelectionCreateNewHint') }}
        </v-card-text>
        <BaseAlert
          :model-value="hasMaxUnits"
          :title="t('messageHasMaxUnitsTitle')"
          :text="t('messageHasMaxUnitsText')"
          :type="VeoAlertType.INFO"
          no-close-button
          flat
        />
        <v-card-text>
          <v-text-field
            v-model="state.newUnitName"
            :label="t('unitSelectionCreateName')"
            :disabled="!!state.selectedUnit || hasMaxUnits"
            :rules="[requiredRule]"
            required
            clearable
            variant="underlined"
          />
          <v-text-field
            v-model="state.newUnitDescription"
            :label="t('unitSelectionCreateDesc')"
            :disabled="!!state.selectedUnit || hasMaxUnits"
            variant="underlined"
            clearable
          />
        </v-card-text>
      </BaseCard>
      <BaseCard class="mt-4">
        <v-card-text>
          <v-icon :icon="mdiFolderOpenOutline" size="x-large" start />
          {{ t('unitSelectionHint') }}
        </v-card-text>
        <v-list-item>
          <v-autocomplete
            v-model="state.selectedUnit"
            :label="t('unitSelectionDropdownLabel')"
            :items="units"
            item-title="name"
            item-value="id"
            flat
            clearable
            variant="underlined"
          />
        </v-list-item>
      </BaseCard>
    </template>
    <template #dialog-options>
      <v-btn flat variant="plain" @click="toggleDialog">
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />

      <v-btn
        flat
        color="primary"
        :loading="state.isApplyingProfile || state.isCreatingUnit"
        :disabled="applyIsDisabled || (hasMaxUnits && !state.selectedUnit)"
        @click="apply"
      >
        {{ t('unitSelectionApplyBtn') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { VeoAlertType } from '~/types/VeoTypes';
import { mdiFolderOpenOutline, mdiFilePlusOutline } from '@mdi/js';
import { useUnits } from './profiles';
const { requiredRule } = useRules();
const { t } = useI18n();
const {
  state,
  units,
  hasMaxUnits,
  domain,
  applyProfile,
  createUnitAndApplyProfile,
  toggleDialog,
} = useUnits();

const applyIsDisabled = computed(
  () => state.newUnitName === null && state.selectedUnit === null
);

function apply() {
  if (!state.selectedUnit) {
    createUnitAndApplyProfile({
      name: state.newUnitName as string,
      domains: [{ targetUri: domain?.value?._self || '' }],
      description: state.newUnitDescription || undefined,
      messages: {
        success: t('messageUnitWithProfileSuccess'),
        error: t('messageUnitWithProfileError'),
      },
    });
  } else {
    applyProfile({
      profileKey: state.selectedProfiles[0],
      unitId: state.selectedUnit,
      domainId: state.domainId,
      messages: { success: t('messageSuccess'), error: t('messageError') },
    });
  }
}
</script>
<i18n src="./messages.json"></i18n>
