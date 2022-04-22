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
      :class="'toc-element-level-'+item.level"
    >
      <a :href="'#'+item.to">{{ item.text }}</a>
    </div>
  </nav>
</template>
<script lang="ts">
import { defineComponent, computed, PropOptions } from '@nuxtjs/composition-api';

export default defineComponent({
  props: {
    value: { type: Array, default: () => [] } as PropOptions<any[]>,
    childrenProperty: { type: String, default: 'children' },
    nameProperty: { type: String, default: 'name' },
    linkProperty: { type: String, default: 'to' },
    levelProperty: { type: String, default: 'level' }
  },
  setup(props) {
    const items = computed(() => {
      const childrenProperty = props.childrenProperty;
      const nameProperty = props.nameProperty;
      const linkProperty = props.linkProperty;
      const levelProperty = props.levelProperty;

      const reduceItems = (items?: any[], level = 1): any[] => {
        if (!items) return [];
        return items.reduce((items, item) => {
          const o = {
            text: item[nameProperty],
            to: item[linkProperty],
            level: item[levelProperty] ?? level
          };
          const children = item[childrenProperty];
          if (children) {
            return items.concat(o, reduceItems(children, level + 1));
          }
          return items.concat(o);
        }, []);
      };

      return reduceItems(props.value) || [];
    });
    return { items };
  }
});
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
        content: ' p. ' target-counter(attr(href), page);
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
      content: counter(counterTocLevel1) '. ' counter(counterTocLevel2) '. ' counter(counterTocLevel3);
      padding-right: 5px;
    }
  }
  .toc-element-level-4 {
    margin-left: 25px;
    counter-increment: counterTocLevel4;
    &::before {
      content: counter(counterTocLevel1) '. ' counter(counterTocLevel2) '. ' counter(counterTocLevel3) '. ' counter(counterTocLevel4);
      padding-right: 5px;
    }
  }
}
</style>