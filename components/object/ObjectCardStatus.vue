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
  <div class="d-flex justify-end w-100 ga-1">
    <v-chip
      v-for="(value, key) in state"
      :key="key"
      data-veo-test="item-card-text-state"
      :style="{ color: stateColors[key] }"
      size="small"
      label
    >
      {{ key }}: {{ value }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  state: Record<string, string>;
}>();

const statusColor = (status: string) => {
  switch (status) {
    case 'Neu':
      return 'red';
    case 'In Bearbeitung':
      return 'orange';
    case 'Zur Prüfung':
      return 'blue';
    case 'Freigegeben':
      return 'green';
    default:
      return 'dark-grey';
  }
};

const stateColors = computed(() =>
  Object.fromEntries(Object.entries(props.state).map(([key, value]) => [key, statusColor(value)]))
);
</script>
