<template>
  <VeoDialog
    v-bind="$attrs"
    :headline="$t('downloadSchema')"
    v-on="$listeners"
  >
    <template #default>
      {{ $t('invalidSchemaConfirmation') }}
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        text
        @click="$emit('input', false)"
      >
        {{ $t('global.button.no') }}
      </v-btn>
      <v-btn
        color="primary"
        text
        @click="$emit('download')"
      >
        {{ $t('global.button.yes') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>

<i18n>
{
  "en": {
    "downloadSchema": "Download schema",
    "invalidSchemaConfirmation": "The form schema is not compatible with current object schemas. Please don't upload it to production. Do you really want to download the schema?"
  },
  "de": {
    "downloadSchema": "Schema herunterladen",
    "invalidSchemaConfirmation": "Das Formschema ist nicht mit keinem aktuellen Objektschema kompatibel. Bitte laden Sie es nicht in der Live-Umgebung hoch. Möchten Sie das Schema trotzdem herunterladen?"
  }
}
</i18n>