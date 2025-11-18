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
  <v-col cols="12">
    <v-card class="pa-4 d-flex flex-column" data-veo-test="veo-card" @click="handleClick()">
      <div class="position-absolute top-0 right-0 ma-2" @click.stop>
        <v-chip :prepend-icon="mdiWeb" variant="flat" size="x-small">
          {{ language }}
        </v-chip>
      </div>

      <v-card-title class="font-weight-bold">
        {{ name }}
      </v-card-title>

      <div class="px-4">
        <div>
          <v-tooltip v-if="descriptionShort" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps">
                {{ descriptionShort }}
              </span>
            </template>
            <span>{{ description }}</span>
          </v-tooltip>

          <span v-else>
            {{ description }}
          </span>
        </div>
      </div>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { mdiWeb } from '@mdi/js';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

interface Props {
  name: string;
  description: string;
  language: string;
  descriptionShort?: string;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'click'): void;
}

const emit = defineEmits<Emits>();

const handleClick = () => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.REPORT_LANG, props.language);
  emit('click');
};
</script>

<style scoped lang="scss"></style>
