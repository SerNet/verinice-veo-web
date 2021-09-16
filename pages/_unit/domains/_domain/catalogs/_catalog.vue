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
                <v-card-subtitle
                  v-if="currentItem"
                  class="py-0"
                >
                  {{ currentItem.designator }}
                </v-card-subtitle>
                <v-card-title
                  v-if="currentItem"
                  class="py-0"
                >
                  {{ currentItem.abbreviation }} {{ currentItem.name }}
                </v-card-title>
                <v-card-text>
                  <v-skeleton-loader
                    v-if="loading || $fetchState.pending"
                    type="paragraph@2"
                  />
                  <span v-else-if="currentItem">{{ currentItem.description }}</span>
                </v-card-text>
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
import { IVeoCatalog, IVeoCatalogItemListItem, IVeoEntity, IVeoLink } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      activeTab: 0 as number,
      loading: false as boolean,
      catalog: undefined as undefined | IVeoCatalog,
      items: [] as IVeoCatalogItemListItem[],
      currentItem: undefined as undefined | IVeoEntity
    };
  },
  async fetch() {
    this.catalog = await this.$api.catalog.fetch(this.catalogId);
    this.items = await this.$api.catalog.fetchItems(this.catalogId, this.domainId);

    await this.fetchItem(this.items[0].element);
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