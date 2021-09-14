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
  <div :class="{'fill-width': fullsize, 'veo-tab-sticky': stickyTabs }">
    <v-tabs v-model="activeTab">
      <slot name="tabs" />
    </v-tabs>
    <v-tabs-items v-model="activeTab">
      <slot name="items" />
    </v-tabs-items>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api';

interface IProps {
  fullsize: boolean;
  startItem: number;
}

export default defineComponent<IProps>({
  props: {
    fullsize: {
      type: Boolean,
      default: false
    },
    startItem: {
      type: Number,
      default: 0
    },
    stickyTabs: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const activeTab = ref(props.startItem);

    return { activeTab };
  }
});
</script>

<style lang="scss" scoped>
.veo-tab-sticky {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.v-tabs {
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>
