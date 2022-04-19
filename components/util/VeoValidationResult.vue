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
    <h3 class="text-h3">
      {{ upperFirst(t('schemaValidationErrors').toString()) }} ({{ result.errors.length }})
    </h3>
    <VeoValidationResultList
      v-bind="$attrs"
      :items="result.errors"
      no-error-placeholder-visible
      :fixing-allowed="fixingAllowed"
      v-on="$listeners"
    />
    <template v-if="warningsVisible">
      <h3 class="text-h3 mt-4">
        {{ upperFirst(t('schemaValidationWarnings').toString()) }} ({{ result.warnings.length }})
      </h3>
      <VeoValidationResultList
        v-if="result.warnings.length"
        v-bind="$attrs"
        :items="result.warnings"
        :fixing-allowed="fixingAllowed"
        v-on="$listeners"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropOptions } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';

export default defineComponent({
  props: {
    warningsVisible: {
      type: Boolean,
      default: false
    },
    result: {
      type: Object,
      required: true
    } as PropOptions<VeoSchemaValidatorValidationResult>,
    fixingAllowed: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { t } = useI18n();

    return {
      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "schemaValidationErrors": "errors",
    "schemaValidationWarnings": "warnings"
  },
  "de": {
    "schemaValidationErrors": "fehler",
    "schemaValidationWarnings": "warnungen"
  }
}
</i18n>