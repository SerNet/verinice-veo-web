<template>
  <VeoDialog
    v-bind="$attrs"
    :headline="$t('schemaValidationWarnings')"
    large
    v-on="$listeners"
  >
    <template #default>
      <VeoValidationResultList
        :result="$attrs.validation"
        show-warnings
        allow-fixing
        v-on="$listeners"
      />
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="$emit('input', false)"
      >
        {{ $t('global.button.close') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';

interface IProps {
  value: boolean;
  validation: VeoSchemaValidatorValidationResult;
}

export default defineComponent<IProps>({
  setup() {
    return {};
  }
});
</script>

<i18n>
{
  "en": {
    "schemaValidationWarnings": "Warnings"
  },
  "de": {
    "schemaValidationWarnings": "Warnungen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
