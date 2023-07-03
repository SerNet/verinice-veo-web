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
  >
    <template #default>
      <BaseCard>
        <v-card-text>
          <v-icon
            :icon="mdiFilePlusOutline"
            size="x-large"
            start
          />
          {{ t('unitSelectionCreateNewHint') }}
        </v-card-text>
        <v-card-text>
          <v-text-field
            v-model="state.newUnit.name"
            :label="t('unitSelectionCreateName')"
            :disabled="!!state.selectedUnit"
            :rules="[requiredRule]"
            required
            clearable
            variant="underlined"
          />
          <v-text-field
            v-model="state.newUnit.description"
            :label="t('unitSelectionCreateDesc')"
            :disabled="!!state.selectedUnit"
            variant="underlined"
            clearable
          />
          <v-autocomplete
            v-model="state.newUnit.selectedDomains"
            :items="toRaw(domains)"
            item-title="name"
            item-key="id"
            :label="t('unitSelectionCreateDomains')"
            chips
            multiple
            flat
            clearable
            return-object
            variant="underlined"
          />
        </v-card-text>
      </BaseCard>
      <BaseCard class="mt-4">
        <v-card-text>
          <v-icon
            :icon="mdiFolderOpenOutline"
            size="x-large"
            start
          />
          {{ t('unitSelectionHint') }}
        </v-card-text>
        <v-list-item>
          <v-autocomplete
            v-model="state.selectedUnit"
            :label="t('unitSelectionDropdownLabel')"
            :items="units"
            :disabled="!!(state.newUnit.name || state.newUnit.description) || state.newUnit.selectedDomains.length !== 0"
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
      <v-btn
        flat
        variant="plain"
        @click="toggleDialog"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />

      <v-btn
        flat
        color="primary"
        :loading="state.isApplyingProfile || state.isCreatingUnit"
        :disabled="applyIsDisabled"
        @click="apply"
      >
        {{ t('unitSelectionApplyBtn') }}
      </v-btn>
    </template>
  </Basedialog>
</template>

<script setup lang="ts">
import {
  mdiFolderOpenOutline,
  mdiFilePlusOutline
} from '@mdi/js';
import { useUnits } from './profiles';
const { requiredRule } = useRules();
const { state, units, domains, applyProfile, createUnitAndApplyProfile, toggleDialog } = useUnits();
const { t } = useI18n();

const applyIsDisabled = computed(() =>
  (state.newUnit.name  === null || toRaw(state.newUnit.selectedDomains).length === 0) && state.selectedUnit === null
);

function apply() {
  if (state.newUnit.name) {
    createUnitAndApplyProfile({
      name: state.newUnit.name,
      domains:
        state.newUnit.selectedDomains.map(domain =>
          toRaw(({targetUri: domain._self}))
        ),
      description: state.newUnit.description || undefined,
      messages: {
        success: t('messageUnitWithProfileSuccess'),
        error: t('messageUnitWithProfileError')
      }
    });
  }
  else {
    applyProfile({
      profileKey: state.selectedProfiles[0],
      unitId: state.selectedUnit,
      domainId: state.domainId,
      messages: {success: t('messageSuccess'), error: t('messageError')}
    });
  }
}
</script>
<i18n src="./messages.json"></i18n>
