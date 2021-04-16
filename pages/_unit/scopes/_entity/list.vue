<template>
  <VeoPage :title="title" fullsize>
    <VeoEntityModifier v-bind="$data" :rootRoute="rootRoute" @fetch="handleUpdates">
      <template #menu-bar="{ on }">
        <VeoMenuButton
          v-on="on"
          :menu-items="menuItems"
          :primary-item="menuButton"
        />
      </template>
      <template #default="{ on }">
        <VeoObjectList
          v-on="on"
          :items="objects"
          :current-item="currentEntity"
          :loading="$fetchState.pending"
          :show-parent-link="showParentLink"
          :load-children="loadSubEntities"
          :sorting-function="sortingFunction"
        />
      </template>
    </VeoEntityModifier>
  </VeoPage>
</template>
<script lang="ts">
import Vue from 'vue'

import { IVeoEntity } from '~/types/VeoTypes'
import { separateUUIDParam } from '~/lib/utils'
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import { IVeoEntityModifierEvent } from '~/components/objects/VeoEntityModifier.vue'

interface IData {
  objects: IVeoEntity[]
  currentEntity: undefined | IVeoEntity
  showParentLink: boolean
  rootEntityType: string
}

export default Vue.extend({
  name: 'VeoObjectsListPage',
  head(): any {
    return {
      title: `${this.title} - ${this.$t('breadcrumbs.scopes')}`
    }
  },
  data(): IData {
    return {
      objects: [],
      currentEntity: undefined,
      showParentLink: false,
      rootEntityType: ''
    }
  },
  asyncData({ from, route }) {
    // Super dirty fix in order to allow navigation to parent object if the user clicked on a child previously.
    // For some reason the page gets recreated completely, rendering beforeRouteUpdate and watch $route completely useless
    return {
      showParentLink: route.name === from.name && route.path !== from.path && route.params.entity !== '-'
    }
  },
  async fetch() {
    if (this.entityType === '-') {
      this.rootEntityType = 'scope'
      this.objects = await this.$api.entity.fetchAll('scope', {
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
    title(): string {
      return this.currentEntity
        ? this.currentEntity.name
        : this.entityType !== '-'
        ? this.entityId
        : this.$t('breadcrumbs.scopes').toString()
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
        }
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
        }
      }
    },
    menuItems(): IVeoMenuButtonItem[] {
      const menuItems: IVeoMenuButtonItem[] = []

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
        })

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
        })
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
        })
      }

      return menuItems
    },
    rootRoute(): string {
      return `/${this.$route.params.unit}/scopes`
    }
  },
  methods: {
    loadSubEntities(_parent: IVeoEntity) {
      return []
    },
    sortingFunction(a: IVeoEntity, b: IVeoEntity) {
      if (a.type === 'scope' && b.type !== 'scope') {
        return -1
      } else if (a.type !== 'scope' && b.type === 'scope') {
        return 1
      } else if (a.type !== 'scope' && b.type !== 'scope') {
        if (a.parts.length > 0 && b.parts.length === 0) {
          return -1
        } else if (a.parts.length === 0 && b.parts.length > 0) {
          return 1
        }
      } else {
        return a.name.localeCompare(b.name)
      }
    },
    handleUpdates(_event: IVeoEntityModifierEvent) {
      this.$fetch() 
    }
  }
})
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
