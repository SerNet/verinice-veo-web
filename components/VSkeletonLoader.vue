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
  <div
    v-for="i in instances"
    :key="i"
    v-bind="$attrs"
    class="v-skeleton-loader pulse"
    data-veo-test="loader"
    :style="{
      width,
      height
    }"
  ></div>
</template>

<script setup lang="ts">
type SKELETON_TYPE = 'text' | 'image' | 'paragraph' | 'heading';

interface Props {
  height?: string;
  type: SKELETON_TYPE;
  width?: string;
}

const props = defineProps<Props>();

const type = computed(() => props.type.split('@')[0]);
const instances = computed(() => Number(props.type.split('@')[1]) || 1);

const width = computed(() => {
  if (props.width) {
    return props.width;
  }
  switch (type.value) {
    case 'text':
    case 'heading':
    case 'image':
      return '50px';
    case 'paragraph':
      return '100%';
    default:
      return 'auto';
  }
});

const height = computed(() => {
  if (props.height) {
    return props.height;
  }
  switch (type.value) {
    case 'text':
    case 'paragraph':
      return '20px';
    case 'heading':
      return '30px';
    case 'image':
      return '50px';
    default:
      return 'auto';
  }
});
</script>

<style lang="scss">
.pulse {
  background:
    linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%),
    lightgray;
  background-repeat: repeat-y;
  background-size: 50px 500px;
  background-position: -50% 0;
  animation: pulse 1.7s infinite;
}

.v-skeleton-loader {
  border-radius: 4px;
  background-color: #e4e4e4;
  cursor: wait;
}

@keyframes pulse {
  to {
    background-position: 150% 0;
  }
}
</style>
