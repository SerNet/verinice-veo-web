<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <VCard
    v-bind="attrs"
    class="veo-card"
    :class="{
      'veo-border': border,
      'mt-4': marginTop,
      'mb-4': marginBottom
    }"
    flat
    rounded
  >
    <v-card-text v-if="padding" class="pa-3 px-4">
      <slot />
    </v-card-text>
    <template v-else>
      <slot />
    </template>
  </VCard>
</template>
<script setup lang="ts">
import { VCard } from 'vuetify/components';

withDefaults(
  defineProps<{
    border?: boolean;
    padding?: boolean;
    marginTop?: boolean;
    marginBottom?: boolean;
  }>(),
  {
    border: false,
    padding: false,
    marginTop: false,
    marginBottom: false
  }
);

const attrs = useAttrs();
</script>

<style lang="scss" scoped>
.veo-card {
  border-radius: 6px;
  overflow: hidden;
}
</style>
