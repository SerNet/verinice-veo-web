<template>
  <VeoDialog
    v-model="dialog.value"
    :headline="$t('schemaValidationWarnings')"
    large
  >
    <template #default>
      <VeoValidationResultList
        :result="$props.validation"
        show-warnings
      />
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="close()"
      >
        {{ $t('global.button.close') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';

interface IProps {
  value: boolean;
  validation: VeoSchemaValidatorValidationResult;
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    validation: {
      type: Object,
      required: true
    }
  },
  setup(props, context) {
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value });

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value.value = val;
      }
    );

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val);
        }
      }
    );

    function close() {
      context.emit('input', false);
    }

    return { dialog, close };
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
