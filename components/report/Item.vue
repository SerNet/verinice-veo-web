<!--
   - verinice.veo web
   - Copyright (C) 2025 Haneen Husin
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
  <v-card class="pa-1 pb-4" data-veo-test="veo-card" @click="handleClick()">
    <div class="d-flex">
      <div class="d-flex flex-column" style="min-width: 0">
        <v-card-title class="d-flex">
          <span class="font-weight-bold text-truncate">
            {{ name }}
          </span>
        </v-card-title>
        <v-tooltip location="bottom" :aria-label="`report-${name}`">
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps" class="pl-4" :class="{ 'text-truncate d-block': clampDescription }">
              {{ description }}
            </span>
          </template>
          <span>{{ description }}</span>
        </v-tooltip>
      </div>

      <v-spacer />

      <v-card-title>
        <v-chip :prepend-icon="mdiWeb" variant="flat" size="x-small">
          {{ language }}
        </v-chip>
      </v-card-title>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { mdiWeb } from '@mdi/js';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

const props = withDefaults(
  defineProps<{
    name: string;
    description: string;
    language: string;
    clampDescription?: boolean;
  }>(),
  { clampDescription: false }
);

interface Emits {
  (e: 'click'): void;
}

const emit = defineEmits<Emits>();

const handleClick = () => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.REPORT_LANG, props.language);
  emit('click');
};
</script>
