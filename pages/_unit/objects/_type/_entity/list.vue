<template>
  <VeoPage :title="title" fullsize>
    <v-row class="justify-space-between">
      <v-col cols="auto">
        <v-btn-toggle mandatory :value="activeView" color="primary" dense>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" @click="navigateList()">
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('breadcrumbs.list_view') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" @click="navigateTree()">
                <v-icon>mdi-file-tree</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('breadcrumbs.tree_view') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" :disabled="$route.params.entity === '-'" @click="navigateDetails()">
                <v-icon>mdi-file</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('breadcrumbs.detail_view') }}
            </template>
          </v-tooltip>
        </v-btn-toggle>
      </v-col>
      <v-col cols="auto" class="mr-4">
        <VeoMenuButton
          :menu-items="menuItems"
          :button-text="$t('object_create', { type: objectCreateText })"
          button-event="create-entity"
          @create-entity="navigateCreate()"
          @add-entity="showAddEntitiesDialog()"
        />
      </v-col>
    </v-row>
    <component
      :is="component"
      :items="objects"
      :loading="$fetchState.pending"
      :show-parent-link="showParentLink"
      :load-children="loadSubEntities"
      @duplicate="doDuplicateEntity"
      @delete="showDeleteEntityDialog"
      @edit="navigateSubEntityDetails"
      @parent="navigateParent"
      @click="navigateSubEntity"
    />
    <VeoDeleteEntityDialog v-model="deleteDialog.value" :form="deleteDialog.item" @delete="doDeleteEntityDialog" />
    <VeoAddEntityDialog
      v-model="addDialog"
      :entities="entities"
      :current-entity="currentEntity"
      @add-entities="doAddEntitiesDialog"
    />
  </VeoPage>
</template>
<i18n>
{
  "en": {
    "clone": "Clone",
    "object_add": "Link {type}",
    "object_cloned": "Object cloned successfully",
    "object_create": "Create {type}",
    "of": "of",
    "showing": "Showing"
  },
  "de": {
    "clone": "Klon",
    "object_add": "{type} verknüpfen",
    "object_cloned": "Objekt wurde geklont",
    "object_create": "{type} erstellen",
    "of": "von",
    "showing": "Zeige"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { capitalize } from 'lodash'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectList from '~/components/objects/VeoObjectList.vue'
import VeoMenuButton, { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import VeoDeleteEntityDialog from '~/components/objects/VeoDeleteEntityDialog.vue'
import VeoAddEntityDialog from '~/components/objects/VeoAddEntityDialog.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaName } from '~/plugins/api/schema'
import { separateUUIDParam } from '~/lib/utils'

export default Vue.extend({
  name: 'VeoObjectsListPage',
  components: {
    VeoPage,
    VeoObjectList,
    VeoMenuButton,
    VeoDeleteEntityDialog,
    VeoAddEntityDialog
  },
  asyncData({from, route}) {
    // Super dirty fix in order to allow navigation to parent object if the user clicked on a child previously.
    // For some reason the page gets recreated completely, rendering beforeRouteUpdate and watch $route completely useless
    return {
      showParentLink: route.name === from.name && route.path !== from.path && route.params.entity !== '-'
    }
  },
  async fetch() {
    if (this.$route.params.entity !== '-') {
      this.objects = await this.$api.entity.fetchSubEntities(this.$route.params.type, this.entityId)
      this.currentEntity = await this.$api.entity.fetch(this.$route.params.type, this.entityId)
    } else {
      this.objects = await this.$api.entity.fetchAll(this.$route.params.type, {
        unit: this.unitId
      })
      this.currentEntity = undefined
    }
  },  
  computed: {
    menuItems(): IVeoMenuButtonItem[] {
      if (this.$route.params.entity === '-') {
        return []
      } else {
        return [
          {
            name: this.$t('object_add', { type: capitalize(this.objectType) }) as string,
            eventName: 'add-entity',
            disabled: false
          }
        ]
      }
    },
    title(): string {
      return this.currentEntity ? this.currentEntity.name : capitalize(this.$route.params.type)
    },
    objectType(): string {
      return getSchemaName(this.$route.params.type) || ''
    },
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    entityId(): string {
      return separateUUIDParam(this.$route.params.entity).id
    },
    objectCreateText(): string {
      return capitalize(this.objectType)
    }
  },
  head(): any {
    return {
      title: `${this.title} - ${this.$t('breadcrumbs.objects')}`
    }
  },
  data() {
    return {
      objects: [] as IVeoEntity[],
      addDialog: false as boolean,
      deleteDialog: { value: false as boolean, item: undefined as IVeoEntity | undefined },
      currentEntity: undefined as undefined | IVeoEntity,
      entities: [] as IVeoEntity[],
      showParentLink: false as boolean,
      component: VeoObjectList,
      activeView: 0
    }
  },
  methods: {
    navigateList() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.generateEntityLink(this.entityId)}/list`
      )
    },
    navigateTree() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.generateEntityLink(this.entityId)}/tree`
      )
    },
    navigateDetails() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.generateEntityLink(this.entityId)}/edit`
      )
    },
    navigateCreate() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.generateEntityLink(this.entityId)}/create`
      )
    },
    navigateSubEntity(item: IVeoEntity) {
      this.$router.push({
        params: {
          entity: this.generateEntityLink(item.id)
        }
      })
    },
    navigateSubEntityDetails(item: IVeoEntity) {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.generateEntityLink(item.id)}/edit`)
    },
    navigateParent() {
      this.$router.back()
    },
    showAddEntitiesDialog() {
      if (this.entities.length === 0) {
        this.$api.entity
          .fetchAll(this.$route.params.type, {
            unit: this.unitId
          })
          .then((entities: IVeoEntity[]) => {
            this.entities = entities
          })
          .finally(() => {
            this.addDialog = true
          })
      } else {
        this.addDialog = true
      }
    },
    doAddEntitiesDialog(entities: string[]) {
      if (this.currentEntity) {
        const children = entities.map((entity: string) => {
          return {
            targetUri: `${this.$config.apiUrl}/${this.$route.params.type}/${entity}`
          }
        })

        this.currentEntity.parts = children
        this.$api.entity.update(this.$route.params.type, this.entityId, this.currentEntity).finally(() => {
          this.addDialog = false
          this.$fetch()
        })
      }
    },
    showDeleteEntityDialog(item: IVeoEntity) {
      this.deleteDialog.item = item
      this.deleteDialog.value = true
    },
    doDeleteEntityDialog(id: string) {
      this.deleteDialog.value = false
      this.$api.entity.delete(this.$route.params.type, id).then(() => {
        this.$fetch()
      })
    },
    doDuplicateEntity(item: IVeoEntity) {
      const newItem = item
      item.name = `${item.name} (${this.$t('clone')})`
      this.$api.entity.create(this.$route.params.type, newItem).then(() => {
        this.$fetch()
        this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
          text: this.$t('object_cloned')
        })
      })
    },
    generateEntityLink(uuid: string) {
      return uuid === '-' ? '-' : `${this.objectType}-${uuid}`
    },
    loadSubEntities(item: IVeoEntity & { children: IVeoEntity[] }) {
      return this.$api.entity.fetchSubEntities(this.$route.params.type, item.id).then((data: IVeoEntity[]) => {
        item.children = data.map((item: IVeoEntity) => {
          if (item.parts.length > 0) {
            return { ...item, children: [] }
          } else {
            return item
          }
        }).sort((a: IVeoEntity, b: IVeoEntity) => {
          return a.name.localeCompare(b.name)
        })
      })
    }
  }
})
</script>

<style lang="scss" scoped></style>
