<!--
   - verinice.veo web
   - Copyright (C) 2022  Markus Werner
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
  <v-chip :closable="close" data-component-name="veo-object-chip" label>
    <div v-if="label || $slots.label" tabindex="0" role="button" :aria-label="label">
      <span v-if="label" v-text="label" />
      <slot v-else name="label" />
    </div>
    <div v-if="value !== true" class="chip-value" tabindex="0" role="button" :aria-label="label">
      <span v-if="value" v-text="value" />
      <slot v-else />
    </div>
  </v-chip>
</template>

<script setup lang="ts">
const _props = withDefaults(
  defineProps<{
    label: string;
    close: boolean;
    value: string | boolean | undefined;
  }>(),
  {
    label: '',
    close: true,
    value: undefined
  }
);
</script>

<style lang="scss" scoped>
.chip-value,
.chip-label {
  background: #36384c;
  color: white;
  padding: 6px 12px 6px 12px;
  z-index: 1;
}

.chip-value {
  border-left: 4px solid slategrey;
  margin-left: 8px;
  margin-right: -12px;
}

:deep(.v-chip__close) {
  max-height: none;
  max-width: none;
  padding: 6px 6px 6px 16px;
  z-index: 1;
}

:deep(.v-chip__content) {
  align-items: center;
  display: flex;
}
</style>
