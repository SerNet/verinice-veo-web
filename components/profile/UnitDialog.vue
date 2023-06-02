<template>
  <BaseDialog
    :model-value="dialog.show"
    :title="t('unitSelectionTitle')"
    :close-function="toggleDialog"
  >
    <template #default>
      <v-list-item>
        <v-autocomplete
          v-model="dialog.selectedUnit"
          :label="t('unitSelectionDropdownLabel')"
          :items="units"
          item-title="name"
          item-value="id"
          flat
          variant="underlined"
        />
      </v-list-item>
      <v-row
        dense
        class="mt-4"
      >
        <v-spacer />
        <v-col
          cols="auto"
        >
          <v-btn
            flat
            variant="plain"
            :disabled="false"
            :loading="false"
            @click="toggleDialog"
          >
            {{ t('global.button.cancel') }}
          </v-btn>

          <v-btn
            flat
            color="primary"
            :disabled="false"
            :loading="dialog.isApplyingProfile"
            @click="() => applyProfile({
              profileKey: profileTable.selectedProfiles[0].key,
              unitId: dialog.selectedUnit
            })"
          >
            {{ t('unitSelectionApplyBtn') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </Basedialog>
</template>

<script setup lang="ts">
import { useUnits, useProfiles } from './profiles.ts';
const { dialog, toggleDialog, units } = useUnits();
const {  profileTable, applyProfile } = useProfiles();
const { t } = useI18n();
</script>
<i18n src="./messages.json"></i18n>
