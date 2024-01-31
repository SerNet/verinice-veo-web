<!--
   - verinice.veo web
   - Copyright (C) 2023 Frank Schneider
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
  <v-row>
    <v-col>
      <div class="headline-container small-caps rounded">
        <span class="headline bg-primary">
          {{ title }}
        </span>

        <span v-if="element" class="headline" style="background: #36384c">
          {{ element }}
        </span>

        <span v-if="description" class="headline" style="background: #56586c">
          {{ description }}
        </span>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const _props = withDefaults(
  defineProps<{
    title: string;
    element?: string;
    description?: string;
  }>(),
  {
    title: '',
    element: '',
    description: ''
  }
);
</script>

<style scoped lang="scss">
.headline-container {
  align-items: center;
  cursor: default;
  display: flex;
  height: 40px;
  margin-left: -16px;
  margin-top: 24px;
  width: max-content;
}

.headline {
  align-items: center;
  border-left: 8px solid slategrey;
  color: white;
  display: flex;
  font-weight: 900;
  height: inherit;
  padding: 0px 16px 0px 16px;
}
</style>
