<template>
  <v-data-table
    :items="items"
    item-key="id"
    :headers="localHeaders"
    :options="{ mustSort: true }"
  >
    <template #item.select="{ item }">
      <v-checkbox
        :value="selectedItems.includes(item.id)"
        @click.stop="onItemSelected(item.id)"
      />
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
  data() {
    return {
      selectedItems: [] as string[]
    };
  },
  computed: {
    localHeaders(): IVeoCatalogSelectionListHeader[] {
      const localHeaders = this.headers;

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
    }
  },
  methods: {
    onItemSelected(id: string) {
      if (this.selectedItems.includes(id)) {
        this.selectedItems = this.selectedItems.filter((_id) => id !== _id);
      } else {
        this.selectedItems.push(id);
      }
      this.$emit('selectedItemsUpdated', this.selectedItems);
    }
  }
});
</script>