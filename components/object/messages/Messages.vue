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
    <div v-for="severity in categorizedMessages" :key="severity.type">
      <span class="font-weight-medium text-body-1 px-4">
        {{ t(severity.type, severity.count) }} ({{ severity.count }})
      </span>
      <v-list role="listbox" :aria-label="t('messages')">
        <ObjectMessagesMessage v-for="message of severity.messages" :key="message.key" :message="message" />
      </v-list>
    </div>
  </div>
</template>

<script lang="ts">
import type { INestedMenuEntries } from '~/components/util/NestedMenu.vue';

export type Message = {
  key: string;
  text: string;
  type: 'error' | 'warning' | 'info' | 'success';
  actions?: INestedMenuEntries[];
};
</script>

<script setup lang="ts">
import { useVeoAlerts } from '~/composables/VeoAlert';

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

const SEVERITIES = [
  { type: 'error', label: t('error') },
  { type: 'warning', label: t('warning') },
  { type: 'info', label: t('info') }
];

const categorizedMessages = computed(() => {
  return SEVERITIES.map(({ type, label }) => {
    const messages = props.messages.filter((m) => m.type === type);

    return {
      type,
      label,
      messages,
      count: messages.length
    };
  }).filter((group) => group.count > 0);
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
