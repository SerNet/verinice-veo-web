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
    v-bind="$attrs"
    class="pulse"
    :style="{
      width,
      height
    }"
  />
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

type SKELETON_TYPE = 'text' | 'image' | 'paragraph' | 'heading';

const props = defineProps({
  height: {
    type: String,
    default: undefined
  },
  type: {
    type: String as PropType<SKELETON_TYPE>,
    required: true
  },
  width: {
    type: String,
    default: undefined
  }
});

const width = computed(() => {
  if(props.width) {
    return props.width;
  }
  switch(props.type) {
    case 'text':
    case 'heading':
    case 'image':
      return '50px';
    case 'paragraph':
      return '100%';
  }
});

const height = computed(() => {
  if(props.height) {
    return props.height;
  }
  switch(props.type) {
    case 'text':
    case 'paragraph':
      return '20px';
    case 'heading':
      return '30px';
    case 'image':
      return '50px';
  }
});
</script>

<style lang="scss">
.pulse {
  background: linear-gradient(to right, #c4c4c4 0%,#cdcdcd 25%,#e4e4e4 100%);
}
</style>
