<!--
   - verinice.veo web
   - Copyright (C) 2021  Tino Groteloh, Davit Svandize
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
  <v-btn
    class="collapse-button px-0"
    :class="{'collapse-button--right': right}"
    small
    elevation="0"
    @click="$emit('input', !value)"
  >
    <v-icon>{{ value !== right ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
  </v-btn>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CollapseButton',
  props: {
    value: {
      // true if collapsed
      type: Boolean
    },
    right: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<style lang="scss" scoped>
.collapse-button {
  position: absolute !important;
  min-width: 35px !important;

  top: 0;

  &:not(.collapse-button--right) {
    left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}

.collapse-button--right {
  right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>