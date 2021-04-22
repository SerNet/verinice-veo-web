<script lang="ts">
import Vue from 'vue'

import { separateUUIDParam } from '~/lib/utils'
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import VeoScopesListPage from '~/pages/_unit/scopes/_entity/list.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import { getSchemaName } from '~/plugins/api/schema'

interface IData {
  objects: IVeoEntity[]
  currentEntity: undefined | IVeoEntity
  showParentLink: boolean
  rootEntityType: string
}

export default Vue.extend({
  name: 'VeoObjectsListPage',
  extends: VeoScopesListPage,
  head(): any {
    return {
      title: `${this.title} - ${this.$t('breadcrumbs.objects')}`
    }
  },
  data(): IData {
    return {
      objects: [],
      currentEntity: undefined,
      showParentLink: false,
      rootEntityType : ''
    }
  },
  async fetch() {
    if (this.entityType === '-') {
      this.rootEntityType = getSchemaName(this.objectType) || ''
      this.objects = await this.$api.entity.fetchAll(this.objectType, {
        unit: this.unitId
      })
      this.currentEntity = undefined
    } else {
      this.rootEntityType = this.entityType
      this.objects = await this.$api.entity.fetchSubEntities(this.entityType, this.entityId)
      this.currentEntity = await this.$api.entity.fetch(this.entityType, this.entityId)
    }
  },
  computed: {
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    entityId(): string {
      return separateUUIDParam(this.$route.params.entity).id
    },
    entityType(): string {
      return separateUUIDParam(this.$route.params.entity).type
    },
    objectType(): string {
      return this.$route.params.type
    },
    title(): string {
      return this.currentEntity?.name || this.$t('breadcrumbs.objects').toString()
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
      }
    },
    menuItems(): IVeoMenuButtonItem[] {
      const menuItems: IVeoMenuButtonItem[] = []

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
        })
      }

      return menuItems
    },
    rootRoute(): string {
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}`
    }
  },
  methods: {
    sortingFunction(a: IVeoEntity, b: IVeoEntity) {
      if (a.parts.length > 0 && b.parts.length === 0) {
        return -1
      } else if (a.parts.length === 0 && b.parts.length > 0) {
        return 1
      } else {
        return a.name.localeCompare(b.name)
      }
    }
  }
})
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