<!--
   - verinice.veo web
   - Copyright (C) 2026 Djordje Mirosavljevic
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
  <v-card-title>{{ name }}</v-card-title>
  <v-card-subtitle v-if="meta">{{ meta }}</v-card-subtitle>
  <v-card-text
    v-if="Object.keys(textDescription).length > 0"
    data-veo-test="item-card-text"
    class="overflow-y-auto text-body-2"
  >
    <span v-for="(value, key) in textDescription" :key="key" class="overflow-y-auto text-body-2 custom-pre">
      <p style="white-space: pre-wrap">{{ value }}</p>
    </span>
  </v-card-text>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    description?: Record<string, unknown> | null;
    meta?: string | null;
  }>(),
  {
    description: () => ({}),
    meta: null
  }
);

const textDescription = computed<Record<string, string>>(() => {
  if (!props.description) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(props.description).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
});
</script>
