<template>
  <v-data-table
    :items="localItems"
    item-key="id"
    :headers="localHeaders"
    :options="{ mustSort: true }"
    class="catalog-selection-list"
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
      <div class="catalog-selection-list__title">
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
.catalog-selection-list.selectable {
  cursor: pointer;
}

.catalog-selection-list__title {
  font-weight: bold;
  white-space: nowrap;
}
</style>
