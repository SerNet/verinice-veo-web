<template>
  <VeoPage :title="title" fullsize>
    <VeoEntityModifier v-bind="$data" :fetch-scopes="fetchScopes" :fetch-entities="fetchEntities" :fetch-schemas="fetchSchemas">
      <template #default="{ on }">
        <VeoObjectList
          v-on="on"
          :items="objects"
          :loading="$fetchState.pending"
          :show-parent-link="showParentLink"
          :load-children="loadSubEntities"
          :sorting-function="sortingFunction"
          :edit-item-link="editItemLink"
        />
      </template>
    </VeoEntityModifier>
  </VeoPage>
</template>
<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectList from '~/components/objects/VeoObjectList.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import { ISchemaEndpoint } from '~/plugins/api/schema'
import { separateUUIDParam } from '~/lib/utils'

interface IData {
  objects: IVeoEntity[]
  currentEntity: undefined | IVeoEntity
  entities: IVeoEntity[]
  scopes: IVeoEntity[]
  showParentLink: boolean,
  schemas: ISchemaEndpoint[]
}

export default Vue.extend({
  name: 'VeoObjectsListPage',
  components: {
    VeoPage,
    VeoObjectList
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
    loadSubEntities(_parent: any) {
      return []
    },
    sortingFunction(a: any, b: any) {
      if (a.members && !b.members) {
        return -1
      } else if (!a.members && b.members) {
        return 1
      } else if (a.parts && b.parts) {
        if (a.parts.length > 0 && b.parts.length === 0) {
          return -1
        } else if (a.parts.length === 0 && b.parts.length > 0) {
          return 1
        }
      } else {
        return a.name.localeCompare(b.name)
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
