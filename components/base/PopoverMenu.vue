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
  <v-menu
    :close-on-content-click="false"
    :nudge-width="0"
    bottom
    offset-y
    rounded="lg"
    max-width="300"
    v-bind="$attrs"
  >
    <template
      v-if="!!$slots.activator"
      #activator="slotListeners"
    >
      <slot
        name="activator"
        v-bind="slotListeners"
      />
    </template>
    <v-card
      flat
      class="text-body-2"
    >
      <slot />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
</script>
