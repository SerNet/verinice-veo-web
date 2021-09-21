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
  <v-data-table
    :items="localItems"
    item-key="id"
    :headers="localHeaders"
    :options="{ mustSort: true }"
    :class="{ 'selectable': selectable }"
    @click:row="onItemSelected($event.id)"
  >
    <template #item.select="{ item }">
      <v-checkbox
        v-model="item.selected"
        hide-details
        class="mt-0 pt-0"
        @click.stop="onItemSelected(item.item.id)"
      />
    </template>
    <template #item.item.title="{ item }">
      <div class="font-weight-bold text-no-wrap">
        {{ item.item.title }}
      </div>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

export interface IVeoCatalogSelectionListHeader {
  filterable?: boolean;
  sortable: boolean;
  text: string;
  value: string;
  width?: number;
}

export default Vue.extend({
  props: {
    value: {
      type: Array as Prop<string[]>,
      default: () => []
    },
    items: {
      type: Array as Prop<any[]>,
      default: () => []
    },
    headers: {
      type: Array as Prop<IVeoCatalogSelectionListHeader[]>,
      default: () => []
    },
    selectable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    localHeaders(): IVeoCatalogSelectionListHeader[] {
      const localHeaders = [...this.headers];

      if (this.selectable) {
        localHeaders.unshift({
          sortable: false,
          filterable: false,
          value: 'select',
          text: '',
          width: 32
        });
      }

      return localHeaders;
    },
    localItems(): { selected: boolean; id: string; item: any }[] {
      return this.items.map((item) => {
        return {
          selected: this.value.includes(item.id),
          id: item.id,
          item
        };
      });
    }
  },
  watch: {
    items(newValue: { id: string; [key: string]: string }[]) {
      const newValues = this.value.filter((selectedItemId: string) => newValue.some((item) => item.id === selectedItemId));
      this.$emit('input', newValues);
    }
  },
  methods: {
    onItemSelected(id: string) {
      let newValues = [...this.value];
      if (newValues.includes(id)) {
        newValues = newValues.filter((_id) => id !== _id);
      } else {
        newValues.push(id);
      }
      this.$emit('input', newValues);
    }
  }
});
</script>

<style lang="scss" scoped>
.selectable {
  cursor: pointer;
}
</style>
