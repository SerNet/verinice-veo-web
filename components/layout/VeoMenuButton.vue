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
  <div>
    <!-- The following html looks bad formatted, as correctly formatting it would insert a whitespace -->
    <v-btn
      :color="color"
      outlined
      :disabled="primaryItem.disabled"
      class="veo-hierarchical-table__expandable-menu-default-button"
      @click="$emit(primaryItem.event.name, primaryItem.event.params)"
    >
      {{ primaryItem.name }}
    </v-btn><v-menu
      bottom
      left
      offset-y
    >
      <template #activator="{ on }">
        <v-btn
          :color="color"
          :disabled="menuItems.length === 0"
          outlined
          class="veo-hierarchical-table__expandable-menu-expand-button"
          v-on="on"
        >
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in menuItems"
          :key="index"
          :disabled="item.disabled"
          @click="$emit(item.event.name, item.event.params)"
        >
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';

export interface IVeoMenuButtonItem {
  disabled: boolean;
  event: {
    name: string;
    params: {
      [key: string]: any;
    };
  };
  name: string;
}

interface IProps {
  menuItems: IVeoMenuButtonItem[];
  disabled: boolean;
  color: string;
  buttonText: string;
  buttonEvent: string;
}

export default defineComponent<IProps>({
  props: {
    menuItems: {
      type: Array as PropType<IVeoMenuButtonItem[]>,
      default: () => []
    },
    color: {
      type: String,
      default: 'primary'
    },
    primaryItem: {
      type: Object as PropType<IVeoMenuButtonItem>,
      required: true
    }
  },
  setup(_props, _context) {}
});
</script>
<style lang="scss" scoped>
.v-btn.veo-hierarchical-table__expandable-menu-expand-button {
  border-bottom-left-radius: 0;
  border-left: 0;
  border-top-left-radius: 0;

  min-width: 32px;
  width: 32px;
}

.v-btn.veo-hierarchical-table__expandable-menu-default-button {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}
</style>
