<template>
  <BaseDialog :model-value="hasInfoDialog" title="Hinweis" large>
    <template #default>
      <BaseAlert
        :model-value="true"
        :title="t('saveRiskDefinitionWarningTitle')"
        :text="t('saveRiskDefinitionWarningBody')"
        :type="VeoAlertType.WARNING"
        no-close-button
        flat
      />

      <v-card v-for="(effect, index) in effects" :key="index" class="mt-2" variant="tonal">
        <v-card-text>{{ effect?.description?.[locale] }}</v-card-text>
      </v-card>
    </template>

    <template #dialog-options>
      <v-btn variant="text" data-veo-test="save-risk-definition-cancel-button" @click="emit('cancel')">
        {{ $t('global.button.cancel') }}
      </v-btn>

      <v-spacer />
      <v-btn
        color="primary"
        :disabled="false"
        variant="text"
        data-veo-test="save-risk-definition-confirm-button"
        @click="emit('save')"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
import { VeoAlertType } from '~/types/VeoTypes';

const { t, locale } = useI18n();
defineProps<{
  hasInfoDialog: boolean;
  effects: Array<{
    description: Record<string, string>;
  }>;
}>();

const emit = defineEmits<{
  (e: 'save' | 'cancel'): void;
}>();
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
