<template>
  <div class="text-left">
    <h3>{{ $t('schemaValidationErrors') }} ({{ result.errors.length }}):</h3>
    <v-list>
      <v-list-item
        v-for="(error, index) of result.errors"
        :key="`e_${index}`"
        link
      >
        <v-list-item-content style="overflow-wrap: anywhere;">
          <v-list-item-title>{{ error.code }} </v-list-item-title>
          {{ error.message }}
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="result.errors.length === 0">
        <v-list-item-content>
          <v-list-item-title>{{ $t('schemaValid') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <template v-if="showWarnings">
      <h3>{{ $t('schemaValidationWarnings') }}: ({{ result.warnings.length }})</h3>
      <v-list>
        <v-list-item
          v-for="(warning, index) of result.warnings"
          :key="`w_${index}`"
          link
        >
          <v-list-item-content style="overflow-wrap: anywhere;">
            <v-list-item-title>{{ warning.code }} </v-list-item-title>
            {{ warning.message }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';

export default Vue.extend({
  props: {
    showWarnings: {
      type: Boolean,
      default: false
    },
    result: {
      type: Object as Prop<VeoSchemaValidatorValidationResult>,
      required: true
    }
  }
});
</script>

<i18n>
{
  "en": {
    "schemaValid": "No errors found!",
    "schemaValidationErrors": "Errors",
    "schemaValidationWarnings": "Warnings"
  },
  "de": {
    "schemaValid": "Keine Fehler gefunden!",
    "schemaValidationErrors": "Fehler",
    "schemaValidationWarnings": "Warnungen"
  }
}
</i18n>