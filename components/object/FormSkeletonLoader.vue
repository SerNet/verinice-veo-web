<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <v-row class="flex-column pt-4">
    <v-col
      v-for="(skeleton, index) of skeletons"
      :key="index"
    >
      <v-skeleton-loader
        :type="skeleton.type"
        :width="skeleton.width"
      />
    </v-col>
  </v-row>
</template>

<script setup lang=ts">
const _skeletons = [
  {
    type: 'heading',
    width: '30%'
  },
  {
    type: 'text',
    width: '20%'
  },
  {
    type: 'text',
    width: '100%'
  },
  {
    type: 'text',
    width: '100%'
  }
];

const skeletons = new Array(3).fill(_skeletons).flat();
</script>
