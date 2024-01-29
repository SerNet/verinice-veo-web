<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner
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
  <nav class="list-toc-generated">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="toc-element"
      :class="'toc-element-level-' + item.level"
    >
      <a :href="'#' + item._path">{{ item.title }}</a>
    </div>
  </nav>
</template>
<script setup lang="ts">
import { PropType } from 'vue';
import { NavItem } from '@nuxt/content/dist/runtime/types';

const props = defineProps({
  modelValue: {
    type: Array as PropType<NavItem[]>,
    default: () => [],
  },
  localeSeparator: {
    type: String,
    default: '.',
  },
});

const items = computed(() =>
  props.modelValue.map((navItem) => ({
    ...navItem,
    level: navItem._path.split('/').length - 1,
  }))
);
</script>

<style lang="scss" scoped>
.list-toc-generated {
  list-style: none;
  counter-reset: counterTocLevel1;
  overflow-x: hidden;
  .toc-element {
    break-inside: avoid;
    display: flex;
    a {
      right: 0;
      &::after {
        content: '' target-counter(attr(href), page);
        float: right;
        position: absolute;
        right: 0;
        background-color: white;
        padding-left: 6px;
      }
    }
    &::after {
      content: '..................................................................................................................................................';
      float: left;
      width: 0;
      padding-left: 5px;
      letter-spacing: 2px;
    }
  }
  .toc-element-level-1 {
    margin-top: 25px;
    font-weight: bold;
    counter-increment: counterTocLevel1;
    counter-reset: counterTocLevel2;
    &::before {
      content: counter(counterTocLevel1) '. ';
      padding-right: 5px;
    }
  }
  .toc-element-level-2 {
    margin-left: 25px;
    counter-increment: counterTocLevel2;
    counter-reset: counterTocLevel3;
    &::before {
      content: counter(counterTocLevel1) '. ' counter(counterTocLevel2) '. ';
      padding-right: 5px;
    }
  }
  .toc-element-level-3 {
    margin-left: 25px;
    counter-increment: counterTocLevel3;
    counter-reset: counterTocLevel4;
    &::before {
      content: counter(counterTocLevel1) '. ' counter(counterTocLevel2) '. '
        counter(counterTocLevel3);
      padding-right: 5px;
    }
  }
  .toc-element-level-4 {
    margin-left: 25px;
    counter-increment: counterTocLevel4;
    &::before {
      content: counter(counterTocLevel1) '. ' counter(counterTocLevel2) '. '
        counter(counterTocLevel3) '. ' counter(counterTocLevel4);
      padding-right: 5px;
    }
  }
}
</style>
