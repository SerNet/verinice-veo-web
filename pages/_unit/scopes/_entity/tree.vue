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
  <VeoPage
    :title="title"
    fullsize
    :loading="$fetchState.pending"
  >
    <VeoEntityModifier
      v-bind="$data"
      :root-route="rootRoute"
      @fetch="handleUpdates"
    >
      <template #menu-bar="{ on }">
        <VeoMenuButton
          :menu-items="menuItems"
          :primary-item="menuButton"
          v-on="on"
        />
      </template>
      <template #default="{ on, entityModifiedEvent }">
        <VeoObjectTree
          :items="objects"
          :current-item="currentEntity"
          :loading="$fetchState.pending"
          :load-more-text="loadMoreText"
          :load-children="loadSubEntities"
          :sorting-function="sortingFunction"
          :entity-modified-event="entityModifiedEvent"
          :object-type="rootEntityType"
          v-on="on"
        />
      </template>
    </VeoEntityModifier>
  </VeoPage>
</template>
<script lang="ts">
import Vue from 'vue';
import { upperFirst } from 'lodash';

import { ITreeEntry } from '~/components/objects/VeoObjectTree.vue';
import { IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';
import { separateUUIDParam } from '~/lib/utils';
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue';
import { IVeoEntityModifierEvent, VeoEntityModifierEventType } from '~/components/objects/VeoEntityModifier.vue';
import { getSchemaEndpoint, IVeoSchemaEndpoint } from '~/plugins/api/schema';

export default Vue.extend({
  name: 'VeoObjectsListPage',
  data() {
    return {
      objects: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      currentEntity: undefined as undefined | IVeoEntity,
      rootEntityType: '' as string,
      schemas: [] as IVeoSchemaEndpoint[]
    };
  },
  async fetch() {
    if (this.entityType === '-') {
      this.rootEntityType = 'scope';
    } else {
      this.rootEntityType = this.entityType;
    }
    await this.refetch(undefined);
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
    },
    loadMoreText(): string {
      return upperFirst(getSchemaEndpoint(this.schemas, this.rootEntityType));
    }
  },
  mounted() {
    this.$api.schema.fetchAll((schemas: IVeoSchemaEndpoint[]) => {
      this.schemas = schemas;
    });
  },
  methods: {
    sortingFunction(a: ITreeEntry, b: ITreeEntry) {
      if (a.entry && b.entry) {
        return a.entry.name.localeCompare(b.entry.name);
      } else {
        return 0;
      }
    },
    async loadSubEntities(parent: ITreeEntry): Promise<void> {
      let id = 0;

      const children: IVeoEntity[] = await this.$api.entity.fetchSubEntities(parent.entry.type, parent.entry.id);
      parent.children = children
        .map((item: IVeoEntity) => {
          const dummy: ITreeEntry = { entry: item, id: parent.id + '.' + id++, type: item.type };

          if (item.members.length > 0 || item.parts.length > 0) {
            dummy.children = [];
          }

          return dummy;
        })
        .sort(this.sortingFunction);
    },
    async fetchEntities(options?: { event: VeoEntityModifierEventType; page?: number; reloadAll?: boolean; sortBy?: string; sortDesc?: boolean }) {
      const _options = { page: 1, reloadAll: true, sortBy: 'name', sortDesc: false, ...options };

      const data = (await this.$api.entity.fetchAll(this.rootEntityType, _options.page, {
        unit: this.unitId,
        sortBy: _options.sortBy,
        sortOrder: _options.sortDesc ? 'desc' : 'asc'
      } as IVeoPaginationOptions)) as IVeoPaginatedResponse<IVeoEntity[]>;

      if (_options.reloadAll) {
        this.objects = data;
      } else {
        this.objects.page = data.page;
        this.objects.items.push(...data.items);
      }
    },
    async fetchSubEntities() {
      const entities = await this.$api.entity.fetchSubEntities(this.entityType, this.entityId);
      this.objects = { items: entities, page: 1, pageCount: 1, totalItemCount: entities.length };
    },
    handleUpdates(event: IVeoEntityModifierEvent) {
      if (event.event === VeoEntityModifierEventType.DISPLAY_CHANGE) {
        this.fetchEntities(event);
      } else if (event.reloadAll) {
        this.refetch(event);
      }
    },
    async refetch(options?: { event: VeoEntityModifierEventType; page?: number; reloadAll?: boolean; sortBy?: string; sortDesc?: boolean }) {
      if (this.entityType === '-') {
        await this.fetchEntities(options);
        this.currentEntity = undefined;
      } else {
        await this.fetchSubEntities();
        this.currentEntity = await this.$api.entity.fetch(this.entityType, this.entityId);
      }
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

<style lang="scss" scoped></style>
