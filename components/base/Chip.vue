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
  <v-chip
    color="primary"
    :closable="close"
    data-component-name="veo-object-chip"
  >
    <div
      v-if="label || $slots.label"
      :class="{ 'chip-label text-black': value === true }"
    >
      <span
        v-if="label"
        v-text="label"
      />
      <slot
        v-else
        name="label"
      />
    </div>
    <div
      v-if="value !== true"
      class="chip-value text-black"
    >
      <span
        v-if="value"
        v-text="value"
      />
      <slot v-else />
    </div>
  </v-chip>
</template>

<script lang="ts" setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  close: {
    type: Boolean,
    default: true
  },
  value: {
    type: [String, Boolean],
    default: undefined
  }
});
</script>

<style lang="scss" scoped>
.v-chip {
  border: 1px solid $primary;
}

.chip-value, .chip-label {
  background: white;
  margin-left: -12px;
  margin-right: -6px;
  padding: 8px 8px 6px 8px;
  z-index: 1;
}

.chip-value{
  border-left: 1px solid $primary;
  margin-left: 8px;
  margin-right: -12px;
}

:deep(.v-chip__close) {
  background-color: #ffffff;
  margin-right: -12px !important;
  max-height: none;
  max-width: none;
  padding: 6px 6px 6px 4px;
  z-index: 1;
}

:deep(.v-chip__content) {
  align-items: center;
  display: flex;
}
</style>
