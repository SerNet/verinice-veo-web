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
    <div
      v-for="section of ['errors', 'warnings', 'information']"
      :key="section"
    >
      <span class="font-weight-medium text-body-1 px-4">
        {{ upperFirst(t(section).toString()) }} ({{ getMessagesBySeverity(section).length }})
      </span>
      <VeoValidationResultList
        :items="getMessagesBySeverity(section)"
        :no-error-placeholder-visible="section === 'errors'"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { upperFirst } from 'lodash';
import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';
import { useVeoAlerts } from '~/composables/VeoAlert';

const props = defineProps({
  messages: {
    type: Object as PropType<VeoSchemaValidatorValidationResult>,
    default: () => ({ valid: true, warnings: [], errors: [] })
  }
});


const { t } = useI18n();
const { displayInfoMessage } = useVeoAlerts();

watch(
  () => props.messages,
  (newValue, oldValue) => {
    for (const message1 of [...newValue.warnings, ...(newValue.information || [])]) {
      if (!oldValue.warnings.find((message2) => message2.code === message1.code) && !oldValue.information?.find((message2) => message2.code === message1.code)) {
        displayInfoMessage(t('newMessage').toString(), message1.message, { timeout: 5000 });
      }
    }
  }
);

const getMessagesBySeverity = (severity: string) => (props.messages as any)[severity] || [];

return {
  getMessagesBySeverity,

  t,
  upperFirst
};
</script>

<i18n>
{
  "en": {
    "errors": "errors",
    "information": "information",
    "messages": "messages",
    "newMessage": "New message",
    "warnings": "warnings"
  },
  "de": {
    "errors": "fehler",
    "information": "informationen",
    "messages": "meldungen",
    "newMessage": "Neue Meldung",
    "warnings": "warnungen"
  }
}
</i18n>
