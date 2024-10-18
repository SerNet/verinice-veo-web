<!--
   - verinice.veo web
   - Copyright (C) 2024 jae
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
  <!-- Admin messages -->
  <BaseContainer v-if="messages.length" class="d-flex flex-direction-column mt-4 px-2 pt-6">
    <v-row>
      <v-col>
        <BaseAlert
          v-for="message in messages"
          :key="message.id"
          :model-value="message.displayProps.isShown"
          :title="message.message[locale]"
          :type="VeoAlertType[message.displayProps.alertType]"
          class="mt-2"
          flat
          :no-close-button="!message.displayProps.isDismissable"
          @update:model-value="message.displayProps.isShown = false"
        >
          {{ t('messageBecomesEffective') }}
        </BaseAlert>
      </v-col>
    </v-row>
  </BaseContainer>
</template>
<script setup lang="ts">
import { TSystemMessage } from '~/composables/messages/useSystemMessages';
import { VeoAlertType } from '~/types/VeoTypes';
defineProps<{ messages: TSystemMessage[] }>();
const { locale, t } = useI18n();
</script>
<i18n>
{
  "en": {
    "messageBecomesEffective": "This message will become effective soon!",
  },
  "de": {
    "messageBecomesEffective": "Diese Nachricht wird bald effektiv!",
  }
}
</i18n>
