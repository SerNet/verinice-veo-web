<template>
  <VeoPage :title="title" fullsize>
    <VeoEntityModifier v-bind="$data" @fetch="$fetch" :rootRoute="rootRoute">
      <template #menu-bar="{ on }">
        <VeoMenuButton
          v-on="on"
          :menu-items="menuItems"
          :primary-item="menuButton"
        />
      </template>
      <template #default="{ on }">
        <VeoObjectTree
          v-on="on"
          :items="objects"
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

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectTree, { ITreeEntry } from '~/components/objects/VeoObjectTree.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import { separateUUIDParam } from '~/lib/utils'
import VeoMenuButton, { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'

interface IData {
  objects: IVeoEntity[]
  currentEntity: undefined | IVeoEntity
  showParentLink: boolean
}

export default Vue.extend({
  name: 'VeoObjectsListPage',
  components: {
    VeoPage,
    VeoMenuButton,
    VeoObjectTree
  },
  head(): any {
    return {
      title: `${this.title} - ${this.$t('breadcrumbs.scopes')}`
    }
  },
  data(): IData {
    return {
      objects: [],
      currentEntity: undefined,
      showParentLink: false
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
      this.objects = await this.$api.entity.fetchAll('scope', {
        unit: this.unitId
      })
      this.currentEntity = undefined
    } else {
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
        : this.$t('breadcrumbs.scopes')
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
      const dummy: IVeoMenuButtonItem[] = []

      // Allow adding (linking) scopes everywhere but root level, add the possibility to add objects there too.
      if (this.entityType === 'scope') {
        dummy.push({
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
        dummy.push({
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
        dummy.push({
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

      return dummy
    },
    rootRoute(): string {
      return `/${this.$route.params.unit}/scopes`
    }
  },
  methods: {
    sortingFunction(a: ITreeEntry, b: ITreeEntry) {
      if (a.entry && b.entry) {
        return a.entry.name.localeCompare(b.entry.name)
      } else {
        return 0
      }
    },
    loadSubEntities(parent: ITreeEntry) {
      let id = 0

      return this.$api.entity
        .fetchSubEntities(parent.entry.type, parent.entry.id)
        .then((data: IVeoEntity[]) => {
          parent.children = data
            .map((item: IVeoEntity) => {
              if (item.type === 'scope' && item.members.length > 0) {
                return { entry: item, children: [] as ITreeEntry[], id: '' + id++ }
              } else if (item.parts && item.parts.length > 0) {
                return { entry: item, children: [] as ITreeEntry[], id: parent.id + '.' + id++ }
              } else {
                return { entry: item, id: parent.id + '.' + id++ }
              }
            })
            .sort(this.sortingFunction)
        })
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
