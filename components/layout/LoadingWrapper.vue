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
  <div class="veo-loading-wrapper d-flex align-center justify-center">
    <v-progress-circular size="64" color="primary" indeterminate />
    <span v-if="text" class="font-size: 1.5rem;">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: undefined,
  },
});
</script>

<style lang="scss" scoped>
.veo-loading-wrapper {
  background-color: rgba(255, 255, 255, 0.6);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1;
}
</style>
