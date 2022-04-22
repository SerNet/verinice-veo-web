<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <v-list
    nav
    dense
  >
    <VeoDocsNavigationItem
      v-for="item of items"
      :key="item.to"
      v-bind="item"
    />
  </v-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';

import { IVeoDocsNavigationItem } from './VeoDocsNavigationItem.vue';

export default defineComponent({
  props: {
    items: {
      type: Array as PropType<IVeoDocsNavigationItem[]>,
      default: () => []
    }
  },
  setup() {
    return {};
  }
});
</script>
