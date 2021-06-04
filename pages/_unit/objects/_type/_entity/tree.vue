<script lang="ts">
import Vue from 'vue';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue';
import VeoScopesTreePage from '~/pages/_unit/scopes/_entity/tree.vue';
import { ITreeEntry } from '~/components/objects/VeoObjectTree.vue';
import { IVeoEntity } from '~/types/VeoTypes';
import { getSchemaName } from '~/plugins/api/schema';

interface IData {
  objects: IVeoEntity[];
  currentEntity: undefined | IVeoEntity;
  rootEntityType: string;
}

export default Vue.extend({
  name: 'VeoObjectsTreePage',
  extends: VeoScopesTreePage,
  data(): IData {
    return {
      objects: [],
      currentEntity: undefined,
      rootEntityType: ''
    };
  },
  async fetch() {
    if (this.entityType === '-') {
      this.rootEntityType = getSchemaName(this.objectType) || '';
      this.objects = await this.$api.entity.fetchAll(this.objectType, {
        unit: this.unitId
      });
      this.currentEntity = undefined;
    } else {
      this.rootEntityType = this.entityType;
      this.objects = await this.$api.entity.fetchSubEntities(this.entityType, this.entityId);
      this.currentEntity = await this.$api.entity.fetch(this.entityType, this.entityId);
    }
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
