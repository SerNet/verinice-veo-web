<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <BaseCard>
    <template v-if="loading">
      <v-card-title v-if="title" class="bg-accent mb-2 small-caps">
        <v-skeleton-loader data-veo-test="loader" type="heading" width="400" />
      </v-card-title>
      <v-card-text>
        <slot v-if="!!$slots.skeleton" name="skeleton"></slot>
        <v-skeleton-loader v-else data-veo-test="loader" type="image" />
      </v-card-text>
    </template>
    <template v-else>
      <v-card-title v-if="title" class="bg-accent mb-2">
        <h2 class="text-h2 small-caps" v-text="title"></h2>
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
    </template>
  </BaseCard>
</template>
<script setup lang="ts">
const _props = withDefaults(
  defineProps<{
    title?: string;
    loading?: boolean;
  }>(),
  {
    title: undefined,
    border: false
  }
);
</script>
