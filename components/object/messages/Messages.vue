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
      {{ t('messages') }}
    </h2>
    <div v-for="(messagesBySeverity, severity) of categorizedMessages" :key="severity">
      <span class="font-weight-medium text-body-1 px-4"> Information ({{ messagesBySeverity.length }}) </span>
      <v-list role="listbox" :aria-label="t('messages')">
        <ObjectMessagesMessage v-for="message of messagesBySeverity" :key="message.key" :message="message" />
      </v-list>
    </div>
  </div>
</template>

<script lang="ts">
export type Message = {
  key: string;
  text: string;
  type: 'error' | 'warning' | 'info' | 'success';
  actions?: INestedMenuEntries[];
};
</script>

<script setup lang="ts">
import { INestedMenuEntries } from '~/components/util/NestedMenu.vue';
import { useVeoAlerts } from '~/composables/VeoAlert';

const SEVERITIES = ['error', 'warning', 'info', 'success'];

const props = withDefaults(
  defineProps<{
    messages: Message[];
  }>(),
  {
    messages: () => []
  }
);

const { t } = useI18n();
const { displayInfoMessage } = useVeoAlerts();

const categorizedMessages = computed(() => {
  const toReturn: Record<string, Message[]> = {};
  for (const message of props.messages) {
    if (SEVERITIES.includes(message.type)) {
      if (!toReturn[message.type]) {
        toReturn[message.type] = [];
      }
      toReturn[message.type].push(message);
    }
  }
  return toReturn;
});

watch(
  () => props.messages,
  (newMessages, oldMessages) => {
    for (const newMessage of newMessages) {
      if (!oldMessages.some((oldMessage) => oldMessage.key === newMessage.key)) {
        displayInfoMessage(t('info', 1), newMessage.text, {
          timeout: 5000
        });
      }
    }
  }
);
</script>

<i18n src="~/locales/base/components/object-messages-messages.json"></i18n>
