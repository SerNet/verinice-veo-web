<!--
   - verinice.veo web
   - Copyright (C) 2026 Haneen Husin
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <v-row class="px-2 bg-basepage">
    <v-col v-if="messages && messages.length">
      <BaseAlert
        v-for="message in messages"
        :key="message.id"
        :model-value="message.isVisible"
        :title="t('title', [message.domainName])"
        :text="t('hin', [message.domainName, message.currentVersion, message.newVersion])"
        :type="VeoAlertType.WARNING"
        class="mt-2 text-pre-wrap"
        :buttons="getMigrationButtons(message)"
        @update:model-value="(val) => handleDismiss(val, message.id)"
      >
      </BaseAlert>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { TDomainUpdateMessage } from '~/composables/domains/useDomainUpdate';
import type { IAlertButton } from './base/Alert.vue';
import { VeoAlertType } from '~/types/VeoTypes';

defineProps<{
  messages: TDomainUpdateMessage[];
}>();

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'dismiss', id: string): void;
}>();

function getMigrationButtons(message: TDomainUpdateMessage): IAlertButton[] {
  return [
    {
      text: t('migration'),
      onClick: () => onUpdateClick(message)
    }
  ];
}

function onUpdateClick(message: TDomainUpdateMessage) {
  // eslint-disable-next-line no-console
  console.log('update', message);
}
function handleDismiss(val: boolean, id: string) {
  if (!val) {
    emit('dismiss', id);
  }
}
</script>

<i18n src="~/locales/base/components/domain-update.json"></i18n>
