<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <div class="text-left">
    <h3>{{ $t('schemaValidationErrors') }} ({{ result.errors.length }}):</h3>
    <VeoValidationResultList
      :items="result.errors"
      show-no-error-text
      :allow-fixing="allowFixing"
      v-on="$listeners"
    />
    <template v-if="showWarnings">
      <h3>{{ $t('schemaValidationWarnings') }} ({{ result.warnings.length }}):</h3>
      <VeoValidationResultList
        :items="result.warnings"
        :allow-fixing="allowFixing"
        v-on="$listeners"
      />
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
    },
    allowFixing: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<i18n>
{
  "en": {
    "schemaValidationErrors": "Errors",
    "schemaValidationWarnings": "Warnings"
  },
  "de": {
    "schemaValidationErrors": "Fehler",
    "schemaValidationWarnings": "Warnungen"
  }
}
</i18n>