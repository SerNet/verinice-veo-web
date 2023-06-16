<!--
   - verinice.veo web
   - Copyright (C) 2023  snxy
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
      <v-card-text>
        <p>{{ t('unitSelectionHint') }}</p>
      </v-card-text>
      <v-list-item>
        <v-autocomplete
          v-model="state.selectedUnit"
          :label="t('unitSelectionDropdownLabel')"
          :items="units"
          item-title="name"
          item-value="id"
          flat
          variant="underlined"
        />
      </v-list-item>
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
        :disabled="false"
        :loading="state.isApplyingProfile"
        @click="() => applyProfile({
          profileKey: state.selectedProfiles[0],
          unitId: state.selectedUnit,
          domainId: state.domainId,
          messages: {success: t('messageSuccess'), error: t('messageError')}
        })"
      >
        {{ t('unitSelectionApplyBtn') }}
      </v-btn>
    </template>
  </Basedialog>
</template>

<script setup lang="ts">
import { useUnits } from './profiles';
const { state, units, applyProfile, toggleDialog } = useUnits();
const { t } = useI18n();
</script>
<i18n src="./messages.json"></i18n>
