<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <div>
    <h2 class="text-h2 px-4 pt-1">
      {{ upperFirst(t('messages').toString()) }}
    </h2>
    <v-divider class="pb-2" />
    <div
      v-for="section of ['errors', 'warnings', 'information']"
      :key="section"
    >
      <h3 class="text-h3 px-4">
        {{ upperFirst(t(section).toString()) }} ({{ getMessagesBySeverity(section).length }})
      </h3>
      <VeoValidationResultList
        :items="getMessagesBySeverity(section)"
        :no-error-placeholder-visible="section === 'errors'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';
import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';

export default defineComponent({
  props: {
    messages: {
      type: Object as PropType<VeoSchemaValidatorValidationResult>,
      default: () => ({ valid: true, warnings: [], errors: [] })
    }
  },
  setup(props) {
    const { t } = useI18n();

    const getMessagesBySeverity = (severity: string) => (props.messages as any)[severity] || [];

    return {
      getMessagesBySeverity,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "errors": "errors",
    "information": "information",
    "messages": "messages",
    "warnings": "warnings"
  },
  "de": {
    "errors": "fehler",
    "information": "informationen",
    "messages": "meldungen",
    "warnings": "warnungen"
  }
}
</i18n>
