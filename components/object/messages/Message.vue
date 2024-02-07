<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <v-list-item :class="`veo-object-message--${message.type}`">
    <v-list-item-title class="text-wrap">
      {{ message.text }}
    </v-list-item-title>
    <v-list-item-action v-if="message.actions?.length">
      <UtilNestedMenu :items="message.actions" bottom right offset-y>
        <template #activator="{ props: menu }">
          <v-tooltip location="left">
            <template #activator="{ props: tooltip }">
              <v-btn :icon="mdiLightbulbOutline" variant="text" v-bind="mergeProps(menu, tooltip)" />
            </template>
            <template #default>
              {{ t('fix') }}
            </template>
          </v-tooltip>
        </template>
      </UtilNestedMenu>
    </v-list-item-action>
  </v-list-item>
</template>

<script setup lang="ts">
import { mergeProps } from 'vue';
import { mdiLightbulbOutline } from '@mdi/js';

import { Message } from '~/components/object/messages/Messages.vue';

defineProps<{
  message: Message;
}>();

const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "fix": "Fix"
  },
  "de": {
    "fix": "Beheben"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-object-message {
  border-left: 4px solid transparent;
}

.veo-object-message--success {
  border-left: 4px solid #4caf50;
}

.veo-object-message--info {
  border-left: 4px solid #2196f3;
}

.veo-object-message--warning {
  border-left: 4px solid #fb8c00;
}

.veo-object-message--error {
  border-left: 4px solid $primary;
}
</style>
