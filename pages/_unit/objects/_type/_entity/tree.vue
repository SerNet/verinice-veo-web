<script lang="ts">
import Vue from 'vue';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue';
import VeoScopesTreePage from '~/pages/_unit/scopes/_entity/tree.vue';
import { ITreeEntry } from '~/components/objects/VeoObjectTree.vue';
import { IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';
import { getSchemaName, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoEntityModifierEvent, VeoEntityModifierEventType } from '~/components/objects/VeoEntityModifier.vue';

export default Vue.extend({
  name: 'VeoObjectsTreePage',
  extends: VeoScopesTreePage,
  data() {
    return {
      objects: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      currentEntity: undefined as undefined | IVeoEntity,
      rootEntityType: '' as string,
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
    await this.refetch(undefined);
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
    sortingFunction(a: ITreeEntry, b: ITreeEntry) {
      if (a.entry && b.entry) {
        return a.entry.name.localeCompare(b.entry.name);
      } else {
        return 0;
      }
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
    "object_create": "Create child object"
  },
  "de": {
    "object_add": "Objekt verknüpfen",
    "object_create": "Unterobjekt erstellen"
  }
}
</i18n>
