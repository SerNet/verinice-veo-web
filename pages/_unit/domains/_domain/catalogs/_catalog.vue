<template>
  <VeoPage
    fullsize
    :loading="$fetchState.pending"
    :title="title"
  >
    <template
      v-if="catalog"
      #default
    >
      <v-card
        flat
        class="border"
      >
        <v-card-title>
          {{ $t('catalog_items') }}
        </v-card-title>
        <v-tabs
          v-model="activeTab"
          vertical
        >
          <v-tab
            v-for="item of items"
            :key="item.id"
          >
            {{ item.element.displayName }}
          </v-tab>
          <v-tabs-items v-model="activeTab">
            <v-tab-item
              v-for="item of items"
              :key="item.id"
            >
              <v-card
                flat
                :loading="loading || $fetchState.pending"
              >
                <v-card-subtitle>{{ item.element.displayName }}</v-card-subtitle>
                <v-card-text>{{ currentItem }}</v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-card>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';
import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoCatalog, IVeoCatalogItem, IVeoCatalogItemListItem, IVeoLink } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      activeTab: 0 as number,
      loading: false as boolean,
      catalog: undefined as undefined | IVeoCatalog,
      items: [] as IVeoCatalogItemListItem[],
      currentItem: undefined as undefined | IVeoCatalogItem
    };
  },
  async fetch() {
    this.catalog = await this.$api.catalog.fetch(this.catalogId);
    this.items = await this.$api.catalog.fetchItems(this.catalogId, this.domainId);

    await this.fetchItem(this.items[0].element);
    console.log(this.currentItem);
  },
  computed: {
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    catalogId(): string {
      return separateUUIDParam(this.$route.params.catalog).id;
    },
    title(): string {
      return this.catalog ? this.$t('catalog', { name: this.catalog?.name }).toString() : '';
    }
  },
  watch: {
    activeTab: {
      async handler(newValue: number) {
        this.loading = true;
        await this.fetchItem(this.items[newValue].element);
        this.loading = false;
      }
    }
  },
  methods: {
    async fetchItem(link: IVeoLink) {
      const { id, type } = getEntityDetailsFromLink(link);
      this.currentItem = await this.$api.entity.fetch(type, id);
    }
  }
});
</script>

<i18n>
{
  "en": {
    "catalog": "Catalog {name}",
    "catalog_items": "Catalog items"
  },
  "de": {
    "catalog": "Katalog {name}",
    "catalog_items": "Katalog Einträge"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.v-card.border {
  border: 1px solid $grey;
}
</style>