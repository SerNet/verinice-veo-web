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
    v-bind="$attrs"
    outlined
    :close="close"
    class="pa-0 pr-2 elevation-0"
    :class="{flag: value===true}"
    style="height: auto;"
    color="primary"
    v-on="$listeners"
  >
    <div
      v-if="label || $scopedSlots.label"
      class="label pa-1 px-2"
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
      v-if="value!==true"
      class="py-1 pl-2 black--text"
    >
      <span
        v-if="value"
        v-text="value"
      />
      <slot v-else />
    </div>
  </v-chip>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  props: {
    label: { type: String, default: '' },
    close: { type: Boolean, default: true },
    value: { type: [String, Boolean], default: undefined }
  },
  setup() {
    return {};
  }
});
</script>
<style lang="scss" scoped>
.v-chip:not(.flag) .label {
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
    z-index: -1;
    background-color: currentColor;
  }
}

.v-chip.flag {
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
    z-index: -1;
    background-color: currentColor;
  }
}

.v-chip--outlined:not(.flag) .label {
  border-right-style: solid;
  border-right-width: 1px;
}

::v-deep .v-chip__close {
  color: #666 !important;
}
</style>