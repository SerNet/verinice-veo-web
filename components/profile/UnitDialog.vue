<template>
  <BaseDialog
    :model-value="state.showDialog"
    :title="t('unitSelectionTitle')"
    :close-function="toggleDialog"
  >
    <template #default>
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
        </v-col>
      </v-row>
    </template>
  </Basedialog>
</template>

<script setup lang="ts">
import { useUnits } from './profiles.ts';
const { state, units, applyProfile, toggleDialog } = useUnits();
const { t } = useI18n();
</script>
<i18n src="./messages.json"></i18n>
