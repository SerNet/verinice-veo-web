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
  <VeoDialog
    v-bind="$attrs"
    :headline="t('schemaValidationWarnings')"
    large
    v-on="$listeners"
  >
    <template #default>
      <VeoValidationResult
        :result="$attrs.validation"
        warnings-visible
        fixing-allowed
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
        {{ t('global.button.close') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';

interface IProps {
  value: boolean;
  validation: VeoSchemaValidatorValidationResult;
}

export default defineComponent<IProps>({
  setup() {
    const { t } = useI18n();

    return {
      t
    };
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
