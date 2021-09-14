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
<script lang="ts">
import Vue from 'vue';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue';
import VeoScopesListPage from '~/pages/_unit/scopes/_entity/list.vue';
import { IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';
import { getSchemaName, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { VeoEntityModifierEventType } from '~/components/objects/VeoEntityModifier.vue';
import { IVeoFilter } from '~/components/layout/VeoListSearchBar.vue';

export default Vue.extend({
  name: 'VeoObjectsListPage',
  extends: VeoScopesListPage,
  data() {
    return {
      filter: undefined as IVeoFilter | undefined,
      objects: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      currentEntity: undefined as undefined | IVeoEntity,
      subEntities: [] as IVeoEntity[],
      showParentLink: false as boolean,
      rootEntityType: '' as string,
      loading: false as boolean,
      schemas: [] as IVeoSchemaEndpoint[]
    };
  },
  async fetch() {
    this.schemas = await this.$api.schema.fetchAll();
    if (this.entityType === '-') {
      this.rootEntityType = getSchemaName(this.schemas, this.objectType) || '';
    } else {
      this.rootEntityType = this.entityType;
    }
    await this.refetch(undefined, true);
  },
  head(): any {
    return {
      title: `${this.title} - ${this.$t('breadcrumbs.objects')}`
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
    objectType(): string {
      return this.$route.params.type;
    },
    title(): string {
      return this.currentEntity?.displayName || this.$t('breadcrumbs.objects').toString();
    },
    menuButton(): IVeoMenuButtonItem {
      return {
        name: this.$t('object_create').toString(),
        event: {
          name: 'create-entity',
          params: {
            type: this.schemas ? getSchemaName(this.schemas, this.objectType) : '',
            parent: this.currentEntity
          }
        },
        disabled: false
      };
    },
    menuItems(): IVeoMenuButtonItem[] {
      const menuItems: IVeoMenuButtonItem[] = [];

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
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}`;
    }
  },
  methods: {
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
    "object_create": "Create child object"
  },
  "de": {
    "object_add": "Objekt verknüpfen",
    "object_create": "Unterobjekt erstellen"
  }
}
</i18n>