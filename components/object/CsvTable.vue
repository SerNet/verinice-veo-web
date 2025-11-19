<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi
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
  <v-data-table :headers="headers" :items="items" dense fixed-header height="600" class="elevation-1 editable-table">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
defineProps({
  headers: { type: Array as () => Record<string, any>[], required: true },
  items: { type: Array as () => Record<string, any>[], required: true }
});
</script>
