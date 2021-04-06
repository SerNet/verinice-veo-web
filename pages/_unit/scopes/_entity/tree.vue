<template>
  <VeoPage :title="title" fullsize>
    <VeoEntityModifier v-bind="$data" :fetch-scopes="fetchScopes" :fetch-entities="fetchEntities" :fetch-schemas="fetchSchemas">
      <VeoObjectTree
        :items="objects"
        :loading="$fetchState.pending"
        :show-parent-link="showParentLink"
        :load-children="loadSubEntities"
        :sorting-function="sortingFunction"
        :edit-item-link="editItemLink"
      />
    </VeoEntityModifier>
  </VeoPage>
</template>
<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectTree, { ITreeEntry } from '~/components/objects/VeoObjectTree.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import { ISchemaEndpoint } from '~/plugins/api/schema'
import { separateUUIDParam } from '~/lib/utils'

interface IData {
  objects: IVeoEntity[]
  currentEntity: undefined | IVeoEntity
  entities: IVeoEntity[]
  scopes: IVeoEntity[]
  showParentLink: boolean
  schemas: ISchemaEndpoint[]
}

export default Vue.extend({
  name: 'VeoObjectsListPage',
  components: {
    VeoPage,
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
      entities: [],
      showParentLink: false,
      scopes: [],
      schemas: []
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
    editItemLink(): string {
      return `/${this.$route.params.unit}/scopes/${this.$route.params.entity}/edit`
    }
  },
  methods: {
    async fetchScopes(): Promise<void> {
      return this.$api.entity.fetchAll('scope', { unit: this.unitId }).then((scopes: IVeoEntity[]) => {
        this.scopes = scopes
      })
    },
    async fetchEntities(): Promise<void> {
      switch (this.entityType) {
        case '-':
        case 'scope':
          if (this.schemas.length === 0) {
            await this.fetchSchemas()
          }

          for (const schema of this.schemas) {
            if (schema) {
              this.entities.push(...(await this.$api.entity.fetchAll(schema.endpoint, { unit: this.unitId })))
            }
          }
          break
        default:
          return (this.entities = await this.$api.entity.fetchAll(this.entityType, { unit: this.unitId }))
      }
    },
    async fetchSchemas(): Promise<void> {
      return this.$api.schema.fetchAll({ unit: this.unitId }).then((schemas: ISchemaEndpoint[]) => {
        this.schemas = schemas
      })
    },
    sortingFunction(a: ITreeEntry, b: ITreeEntry) {
      if (a.entry && b.entry) {
        return a.entry.name.localeCompare(b.entry.name)
      } else {
        return 0
      }
    },
    loadSubEntities(parent: ITreeEntry) {
      let id = 0
      if (parent.entry.$type === 'scope') {
        return this.$api.entity.fetchScopeMembers('scope', parent.entry.id).then((data: IVeoEntity[]) => {
          parent.children = data
            .map((item: IVeoEntity) => {
              if (item.$type === 'scope' && item.members.length > 0) {
                return { entry: item, children: [] as ITreeEntry[], id: '' + id++ }
              } else if (item.parts && item.parts.length > 0) {
                return { entry: item, children: [] as ITreeEntry[], id: parent.id + '.' + id++ }
              } else {
                return { entry: item, id: parent.id + '.' + id++ }
              }
            })
            .sort(this.sortingFunction)
        })
      } else {
        return this.$api.entity
          .fetchSubEntities(parent.entry.$type || '', parent.entry.id)
          .then((data: IVeoEntity[]) => {
            parent.children = data
              .map((item: IVeoEntity) => {
                if (item.$type === 'scope' && item.members.length > 0) {
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
  }
})
</script>

<style lang="scss" scoped></style>
