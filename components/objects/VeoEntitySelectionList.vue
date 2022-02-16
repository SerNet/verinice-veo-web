<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Tino Groteloh, Jessica Lühnen
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
  <VeoObjectTable
    v-model="selectedItems"
    show-select
    v-bind="$attrs"
    v-on="$listeners"
    @page-change="$emit('page-change', $event)"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropOptions } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'VeoEntitySelectionList',
  props: {
    value: {
      type: Array,
      default: () => []
    } as PropOptions<{ id: string; type: string }[]>
  },
  setup(props, { emit }) {
    const selectedItems = computed({
      get() {
        return props.value;
      },
      set(value) {
        emit('input', value);
      }
    });

    return {
      selectedItems
    };
  }
});
</script>
