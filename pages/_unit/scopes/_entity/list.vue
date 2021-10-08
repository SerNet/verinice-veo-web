<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Jessica Lühnen
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
    :title="title"
    fullsize
    :loading="$fetchState.pending"
  >
    <VeoEntityModifier
      v-bind="$data"
      :root-route="rootRoute"
      @fetch="refetch"
    >
      <template #menu-bar="{ on }">
        <v-row>
          <v-spacer />
          <v-col cols="auto">
            <VeoMenuButton
              :menu-items="menuItems"
              :primary-item="menuButton"
              v-on="on"
            />
          </v-col>
        </v-row>
      </template>
      <template #default="{ on }">
        <v-row>
          <v-col
            class="flex-grow-1 search-bar"
            :class="{ 'search-bar-desktop': $vuetify.breakpoint.lgAndUp }"
          >
            <VeoListSearchBar
              v-model="filter"
              :object-type="rootEntityType"
              @reset="filter = $event"
            />
          </v-col>
        </v-row>
        <VeoObjectList
          :items="objects"
          :current-item="currentEntity"
          :loading="$fetchState.pending || loading"
          :show-parent-link="showParentLink"
          :load-children="loadSubEntities"
          :object-type="rootEntityType"
          v-on="on"
        />
      </template>
    </VeoEntityModifier>
  </VeoPage>
</template>
<script lang="ts">
import Vue from 'vue';

import { IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';
import { separateUUIDParam } from '~/lib/utils';
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue';
import { VeoEntityModifierEventType } from '~/components/objects/VeoEntityModifier.vue';
import { IVeoFilter } from '~/components/layout/VeoListSearchBar.vue';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';

export default Vue.extend({
  name: 'VeoObjectsListPage',
  asyncData({ from, route }) {
    // Super dirty fix in order to allow navigation to parent object if the user clicked on a child previously.
    // For some reason the page gets recreated completely, rendering beforeRouteUpdate and watch $route completely useless
    return {
      showParentLink: route.name === from.name && route.path !== from.path && route.params.entity !== '-'
    };
  },
  data() {
    return {
      filter: undefined as IVeoFilter | undefined,
      objects: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      currentEntity: undefined as undefined | IVeoEntity,
      subEntities: [] as IVeoEntity[],
      showParentLink: false as boolean,
      rootEntityType: '' as string,
      loading: false as boolean,
      // @see https://git.nbrx.de/nbrx/t1/veo/-/issues/297
      schemas: [] as IVeoSchemaEndpoint[]
    };
  },
  async fetch() {
    if (this.entityType === '-') {
      this.rootEntityType = 'scope';
    } else {
      this.rootEntityType = this.entityType;
    }
    await this.refetch(undefined, true);
  },
  head(): any {
    return {
      title: `${this.title} - ${this.$t('breadcrumbs.scopes')}`
    };
  },
  computed: {
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id;
    },
    entityId(): string {
      return separateUUIDParam(this.$route.params.entity).id;
    },
    entityType(): string {
      return separateUUIDParam(this.$route.params.entity).type;
    },
    title(): string {
      return this.currentEntity?.displayName || this.$t('breadcrumbs.scopes').toString();
    },
    menuButton(): IVeoMenuButtonItem {
      if (this.entityType !== '-' && this.entityType !== 'scope') {
        return {
          name: this.$t('object_create').toString(),
          event: {
            name: 'create-entity',
            params: {
              parent: this.currentEntity
            }
          },
          disabled: false
        };
      } else {
        return {
          name: this.$t('scope_create').toString(),
          event: {
            name: 'create-scope',
            params: {
              parent: this.currentEntity
            }
          },
          disabled: false
        };
      }
    },
    menuItems(): IVeoMenuButtonItem[] {
      const menuItems: IVeoMenuButtonItem[] = [];

      // Allow adding (linking) scopes everywhere but root level, add the possibility to add objects there too.
      if (this.entityType === 'scope') {
        menuItems.push({
          name: this.$t('scope_add') as string,
          event: {
            name: 'add-scope',
            params: {
              parent: this.currentEntity
            }
          },
          disabled: false
        });

        // Only add the entity create button if the user is in a scope, as it is the primary choice in entities
        menuItems.push({
          name: this.$t('object_create') as string,
          event: {
            name: 'create-entity',
            params: {
              parent: this.currentEntity
            }
          },
          disabled: false
        });
      }

      // Allow entity management on all levels but the root level
      if (this.entityType !== '-') {
        menuItems.push({
          name: this.$t('object_add') as string,
          event: {
            name: 'add-entity',
            params: {
              parent: this.currentEntity
            }
          },
          disabled: false
        });
      }

      return menuItems;
    },
    rootRoute(): string {
      return `/${this.$route.params.unit}/scopes`;
    }
  },
  watch: {
    filter(newValue: IVeoFilter) {
      this.$router.push({
        ...this.$route,
        query: {
          designator: newValue?.designator,
          name: newValue?.name,
          description: newValue?.description,
          updatedBy: newValue?.updatedBy,
          status: newValue?.status
        }
      });
      this.$fetch();
    }
  },
  mounted() {
    this.filter = {
      designator: this.$route.query.designator,
      name: this.$route.query.name,
      description: this.$route.query.description,
      updatedBy: this.$route.query.updatedBy,
      status: this.$route.query.status
    };
  },
  methods: {
    loadSubEntities(_parent: IVeoEntity) {
      return [];
    },
    async refetch(options?: { event: VeoEntityModifierEventType; page?: number; reloadAll?: boolean; sortBy?: string; sortDesc?: boolean }, seed: boolean = false) {
      this.loading = true;
      try {
        if (this.entityType === '-') {
          await this.fetchEntities(options);
          this.currentEntity = undefined;
        } else {
          await this.fetchSubEntities(options, seed);
          this.currentEntity = await this.$api.entity.fetch(this.entityType, this.entityId);
        }
      } finally {
        this.loading = false;
      }
    },
    async fetchEntities(options?: { event: VeoEntityModifierEventType; page?: number; reloadAll?: boolean; sortBy?: string; sortDesc?: boolean }) {
      const _options = { page: 1, reloadAll: true, sortBy: 'name', sortDesc: false, ...options };

      const data = (await this.$api.entity.fetchAll(this.rootEntityType, _options.page, {
        unit: this.unitId,
        size: this.$user.tablePageSize,
        sortBy: _options.sortBy,
        sortOrder: _options.sortDesc ? 'desc' : 'asc',
        ...(this.filter || {})
      } as IVeoPaginationOptions)) as IVeoPaginatedResponse<IVeoEntity[]>;

      if (_options.reloadAll) {
        this.objects = data;
      } else {
        this.objects.page = data.page;
        this.objects.items.push(...data.items);
      }
    },
    // As the sub entities are not paginated, we fake a pagination to avoid too much additional code for non-paginated data
    async fetchSubEntities(options?: { event: VeoEntityModifierEventType; page?: number; sortBy?: string; sortDesc?: boolean }, seed: boolean = false) {
      const _options = { page: options?.page || 1, sortBy: options?.sortBy || 'name', sortDesc: options?.sortDesc || false, event: options?.event };

      // Populate the array with all subentities if not already done
      if (seed || options?.event !== VeoEntityModifierEventType.DISPLAY_CHANGE) {
        this.subEntities = await this.$api.entity.fetchSubEntities(this.entityType, this.entityId);
      }

      // @ts-ignore
      const filteredObjects = this.subEntities.filter((subEntities) => !this.filter || !this.filter.value || subEntities[this.filter.property].includes(this.filter.value));

      // Do everything the backend would do if paginated
      this.objects = {
        items: filteredObjects
          .slice((_options.page - 1) * this.$user.tablePageSize, _options.page * this.$user.tablePageSize - 1)
          .sort((a: IVeoEntity & { [key: string]: any }, b: IVeoEntity & { [key: string]: any }) => {
            if (a[_options.sortBy] > b[_options.sortBy]) {
              return _options.sortDesc ? 1 : -1;
            } else if (a[_options.sortBy] < b[_options.sortBy]) {
              return _options.sortDesc ? -1 : 1;
            } else {
              return 0;
            }
          }),
        totalItemCount: filteredObjects.length,
        page: _options.page,
        pageCount: Math.ceil(filteredObjects.length / this.$user.tablePageSize)
      };
    }
  }
});
</script>

<i18n>
{
  "en": {
    "object_add": "Link object",
    "object_create": "Create object",
    "scope_add": "Link scope",
    "scope_create": "Create scope"
  },
  "de": {
    "object_add": "Objekt verknüpfen",
    "object_create": "Objekt erstellen",
    "scope_add": "Scope verknüpfen",
    "scope_create": "Scope erstellen"
  }
}
</i18n>

<style lang="scss" scoped>
.search-bar-desktop {
  margin: 0 100px;
}
</style>