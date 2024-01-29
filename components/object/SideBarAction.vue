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
  <v-tooltip location="start">
    <template #activator="{ props: activatorProps }">
      <slot v-bind="{ props, activatorProps }">
        <v-btn
          v-bind="activatorProps"
          :data-component-name="dataComponentName"
          class="my-1 py-1"
          :icon="icon"
          :value="value"
          :disabled="disabled"
        />
      </slot>
    </template>
    <template #default>
      {{ name }}
    </template>
  </v-tooltip>
</template>

<script lang="ts">
export type SideBarAction = {
  dataComponentName: string;
  icon: string;
  name: string;
  component: any;
  props?: Record<string, any>;
  disabled?: boolean;
};
</script>

<script setup lang="ts">
const props = defineProps<SideBarAction & { value: string }>();
</script>
