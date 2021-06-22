<script lang="ts">
import Vue from 'vue';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue';
import VeoScopesListPage from '~/pages/_unit/scopes/_entity/list.vue';
import { IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';
import { getSchemaName } from '~/plugins/api/schema';
import { VeoEntityModifierEventType } from '~/components/objects/VeoEntityModifier.vue';

export default Vue.extend({
  name: 'VeoObjectsListPage',
  extends: VeoScopesListPage,
  data() {
    return {
      objects: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      currentEntity: undefined as undefined | IVeoEntity,
      subEntities: [] as IVeoEntity[],
      showParentLink: false as boolean,
      rootEntityType: '' as string,
      loading: false as boolean
    };
  },
  async fetch() {
    if (this.entityType === '-') {
      this.rootEntityType = getSchemaName(this.objectType) || '';
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
            type: getSchemaName(this.objectType),
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
    sortingFunction(a: IVeoEntity, b: IVeoEntity) {
      if (a.parts.length > 0 && b.parts.length === 0) {
        return -1;
      } else if (a.parts.length === 0 && b.parts.length > 0) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    },
    async refetch(options?: { event: VeoEntityModifierEventType; page?: number; reloadAll?: boolean; sortBy?: string; sortDesc?: boolean }, seed: boolean = false) {
      this.loading = true;
      if (this.entityType === '-') {
        await this.fetchEntities(options);
        this.currentEntity = undefined;
      } else {
        await this.fetchSubEntities(options, seed);
        this.currentEntity = await this.$api.entity.fetch(this.entityType, this.entityId);
      }
      this.loading = false;
    },
    async fetchEntities(options?: { event: VeoEntityModifierEventType; page?: number; reloadAll?: boolean; sortBy?: string; sortDesc?: boolean }) {
      const _options = { page: 1, reloadAll: true, sortBy: 'name', sortDesc: false, ...options };

      const data = (await this.$api.entity.fetchAll(this.rootEntityType, _options.page, {
        unit: this.unitId,
        size: this.$user.tablePageSize,
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
    // As the sub entities are not paginated, we fake a pagination to avoid too much additional code for non-paginated data
    async fetchSubEntities(options?: { event: VeoEntityModifierEventType; page?: number; sortBy?: string; sortDesc?: boolean }, seed: boolean = false) {
      const _options = { page: options?.page || 1, sortBy: options?.sortBy || 'name', sortDesc: options?.sortDesc || false, event: options?.event };

      // Populate the array with all subentities if not already done
      if (seed || options?.event !== VeoEntityModifierEventType.DISPLAY_CHANGE) {
        this.subEntities = await this.$api.entity.fetchSubEntities(this.entityType, this.entityId);
      }

      // Do everything the backend would do if paginated
      this.objects = {
        items: this.subEntities
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
        totalItemCount: this.subEntities.length,
        page: _options.page,
        pageCount: Math.ceil(this.subEntities.length / this.$user.tablePageSize)
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