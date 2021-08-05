<template>
  <VeoPage
    fullsize
    :loading="$fetchState.pending"
    :title="title"
  >
    <template
      #default
    >
      <v-card
        flat
        class="border"
      >
        <v-card-title v-if="items[0]">
          {{ $t('catalog_items', { catalog: items[0].catalog.displayName.toString() }) }}
        </v-card-title>
        <v-card-text>
          <VeoCatalogSelectionList
            :selected-items="selectedItems"
            :items="items"
            selectable
            @selectedItemsUpdated="onNewItemsSelected"
          />
        </v-card-text>
      </v-card>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';
import { separateUUIDParam } from '~/lib/utils';

export default Vue.extend({
  data() {
    return {
      items: [] as any[],
      selectedItems: [] as { type: string; id: string }[]
    };
  },
  async fetch() {
    this.items = await this.$api.catalog.fetchItems(this.catalogId, this.domainId);
    console.log(this.items);
  },
  computed: {
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    catalogId(): string {
      return separateUUIDParam(this.$route.params.catalog).id;
    },
    title(): string {
      return this.items.length > 0 && this.items[0].catalog ? this.$t('catalog', { name: this.items[0].catalog.displayName }).toString() : '';
    }
  },
  methods: {
    onNewItemsSelected(items: { type: string; id: string }[]) {
      this.selectedItems = items;
    }
  }
});
</script>

<i18n>
{
  "en": {
    "catalog": "Catalog {name}",
    "catalog_items": "Catalog items for {catalog}"
  },
  "de": {
    "catalog": "Katalog {name}",
    "catalog_items": "Katalog Einträge für {catalog}"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.v-card.border {
  border: 1px solid $grey;
}
</style>