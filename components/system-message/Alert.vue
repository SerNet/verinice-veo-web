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
  <v-row class="px-2 bg-basepage">
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
        <div class="d-flex">
          <v-icon :icon="mdiAlarm" />
          <span>&nbsp;</span>
          <span>{{ formatTime(message.displayProps.effectiveDate).value }}</span>
        </div>

        <SystemMessageTimer v-if="message.displayProps.isUrgent" :effective-date="message.displayProps.effectiveDate" />
      </BaseAlert>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { useFormatters } from '~/composables/utils';
import { TSystemMessage } from '~/composables/messages/useSystemMessages';
import { VeoAlertType } from '~/types/VeoTypes';
import { mdiAlarm } from '@mdi/js';
defineProps<{ messages: TSystemMessage[] }>();
const { locale } = useI18n();
const { formatTime } = useFormatters();
</script>
