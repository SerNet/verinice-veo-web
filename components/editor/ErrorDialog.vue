<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
    :model-value="modelValue"
    v-bind="$attrs"
    :title="upperFirst(t('schemaValidationWarnings').toString())"
    large
    fixed-footer
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <UtilValidationResults v-bind="$attrs" :messages="validation" enable-fixing />
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn variant="text" color="primary" @click="$emit('update:model-value', false)">
        {{ t('global.button.close') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    validation: {
      type: Object as PropType<VeoSchemaValidatorValidationResult>,
      default: () => ({
        valid: true,
        errors: [],
        warnings: []
      })
    }
  },
  emits: ['update:model-value'],
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
