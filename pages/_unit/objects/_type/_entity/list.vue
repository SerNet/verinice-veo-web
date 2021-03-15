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
          @create-entity="navigateCreate"
          @add-entity="showAddEntitiesDialog('entities', $event)"
        />
      </v-col>
    </v-row>
    <VeoObjectList
      :items="objects"
      :loading="$fetchState.pending"
      :show-parent-link="showParentLink"
      :load-children="loadSubEntities"
      :sorting-function="sortingFunction"
      @duplicate="doDuplicateEntity"
      @delete="showDeleteEntityDialog"
      @edit="navigateSubEntityDetails"
      @unlink="showUnlinkEntityDialog"
      @navigate-parent="navigateParent"
      @click="navigateSubEntity"
      @create-entity="navigateCreate"
      @add-entity="showAddEntitiesDialog('entities', $event)"
    />
    <VeoDeleteEntityDialog v-model="deleteDialog.value" v-bind="deleteDialog" @delete="doDeleteEntityDialog" />
    <VeoUnlinkEntityDialog v-model="unlinkDialog.value" v-bind="unlinkDialog" @unlink="doUnlinkEntityDialog" />
    <VeoAddEntityDialog v-model="addDialog.value" v-bind="addDialog" @add-entities="doAddEntitiesDialog" />
  </VeoPage>
</template>
<i18n>
{
  "en": {
    "clone": "Clone",
    "object_add": "Link {type}",
    "object_cloned": "Object cloned successfully",
    "object_create": "Create {type}",
    "object_delete_error": "Failed to delete object",
    "object_duplicate_error": "Failed to duplicate object",
    "object_unlink_error": "Failed to unlink object",
    "object_update_error": "Failed to update object"
  },
  "de": {
    "clone": "Klon",
    "object_add": "{type} verknüpfen",
    "object_cloned": "Objekt wurde geklont",
    "object_create": "{type} erstellen",
    "object_delete_error": "Objekt konnte nicht gelöscht werden",
    "object_duplicate_error": "Objekt konnte nicht erstellt werden",
    "object_unlink_error": "Verlinkung konnte nicht entfernt werden",
    "object_update_error": "Objekt konnte nicht aktualisiert werden"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { capitalize } from 'lodash'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectList from '~/components/objects/VeoObjectList.vue'
import VeoMenuButton, { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import { IVeoAPIMessage, IVeoEntity, IVeoLink } from '~/types/VeoTypes'
import VeoDeleteEntityDialog from '~/components/objects/VeoDeleteEntityDialog.vue'
import VeoUnlinkEntityDialog from '~/components/objects/VeoUnlinkEntityDialog.vue'
import VeoAddEntityDialog, { IItem } from '~/components/objects/VeoAddEntityDialog.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaName, ISchemaEndpoint } from '~/plugins/api/schema'
import { separateUUIDParam } from '~/lib/utils'

interface IData {
  objects: IVeoEntity[]
  addDialog: {
    value: boolean
    items: IItem[]
    editedItem?: IVeoEntity
    eventName: string
  }
  deleteDialog: {
    value: boolean
    item: undefined | IVeoEntity
  }
  unlinkDialog: {
    value: boolean
    item: undefined | IVeoEntity
    parent: undefined | IVeoEntity
  }
  currentEntity: undefined | IVeoEntity
  entities: IVeoEntity[]
  showParentLink: boolean
  activeView: number
}

export default Vue.extend({
  name: 'VeoObjectsListPage',
  components: {
    VeoPage,
    VeoObjectList,
    VeoMenuButton,
    VeoDeleteEntityDialog,
    VeoUnlinkEntityDialog,
    VeoAddEntityDialog
  },
  asyncData({ from, route }) {
    // Super dirty fix in order to allow navigation to parent object if the user clicked on a child previously.
    // For some reason the page gets recreated completely, rendering beforeRouteUpdate and watch $route completely useless
    return {
      showParentLink: route.name === from.name && route.path !== from.path && route.params.entity !== '-'
    }
  },
  data(): IData {
    return {
      objects: [],
      addDialog: {
        editedItem: undefined,
        eventName: 'add-entities',
        items: [],
        value: false
      },
      deleteDialog: {
        value: false,
        item: undefined
      },
      unlinkDialog: {
        value: false,
        item: undefined,
        parent: undefined
      },
      currentEntity: undefined as undefined | IVeoEntity,
      entities: [] as IVeoEntity[],
      showParentLink: false as boolean,
      activeView: 0
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
    navigateCreate(parent?: IVeoEntity) {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.generateEntityLink(
          parent?.id || this.entityId
        )}/create`
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
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.generateEntityLink(item.id)}/edit`
      )
    },
    navigateParent() {
      this.$router.back()
    },
    async fetchEntities() {
      return this.$api.entity
        .fetchAll(this.$route.params.type, { unit: this.unitId })
        .then((entities: IVeoEntity[]) => {
          this.entities = entities
        })
    },
    async showAddEntitiesDialog(type: 'entities' | 'scopes', item?: IVeoEntity) {
      let currentItem
      if (item) {
        currentItem = item
      } else {
        currentItem = this.currentEntity
      }

      if (currentItem) {
        if (type === 'scopes') {
          throw new Error("Objects doesn't support Scope management")
        } else {
          if (this.entities.length === 0) {
            await this.fetchEntities()
          }

          this.addDialog.items = this.entities.map(entity => {
            return {
              id: entity.id,
              type: entity.$type,
              name: entity.name,
              hidden: false,
              selected: false
            }
          })
        }

        let links: IVeoLink[]
        if (currentItem.$type === 'scope') {
          throw new Error("Objects doesn't support Scope management")
        } else {
          links = (currentItem as IVeoEntity).parts
        }

        for (const link of links) {
          const destructedLink = link.targetUri.split('/')
          const id = destructedLink.pop() || ''
          const type = destructedLink.pop() || ''

          const itemIndex = this.addDialog.items.findIndex(item => item.id === id)

          // If the item exists, simply set its selected value to true. Else the item is a scope.
          // To avoid an api call, we simply take the values from the existing link
          if (itemIndex > 0) {
            this.addDialog.items[itemIndex].selected = true
          } else {
            this.addDialog.items.push({
              id,
              type,
              name: link.displayName,
              hidden: true,
              selected: true
            })
          }
        }

        this.addDialog.editedItem = currentItem
        this.addDialog.eventName = 'add-entities'
        this.addDialog.value = true
      }
    },
    async doAddEntitiesDialog(entities: IItem[], parent?: IVeoEntity) {
      let entity: IVeoEntity | undefined = parent || this.addDialog.editedItem
      if (entity) {
        const children = entities.map(_entity => {
          return {
            targetUri: `/${_entity.type}/${_entity.id}`
          }
        })

        // We fetch the parent entity, as not all flows use the properly fetched entity with an etag, however we need one when updating
        if (entity.$type === 'scope') {
          throw new Error("Objects doesn't support Scope management")
        } else {
          // @ts-ignore
          entity.parts = children
          const updatedElementEtag = (await this.$api.entity.fetch(entity.$type, entity.id)).$etag
          if (entity && updatedElementEtag && !(entity as any).$etag) {
            // @ts-ignore
            entity.$etag = updatedElementEtag
          }
          this.$api.entity
            .update(entity.$type, entity?.id, entity)
            .catch((error: any) => {
              this.$root.$emit(VeoEvents.ALERT_ERROR, {
                title: this.$t('object_update_error'),
                text: JSON.stringify(error)
              })
            })
            .finally(() => {
              this.addDialog.value = false
              this.$fetch()
            })
        }
      }
    },
    showDeleteEntityDialog(item: IVeoEntity) {
      this.deleteDialog.item = item
      this.deleteDialog.value = true
    },
    doDeleteEntityDialog(id: string) {
      this.deleteDialog.value = false
      this.$api.entity
        .delete(this.$route.params.type, id)
        .then(() => {
          this.$fetch()
        })
        .catch((error: any) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, {
            title: this.$t('object_delete_error'),
            text: JSON.stringify(error)
          })
        })
    },
    showUnlinkEntityDialog(item: IVeoEntity, parent?: IVeoEntity) {
      this.unlinkDialog.item = item
      this.unlinkDialog.parent = parent || this.currentEntity
      this.unlinkDialog.value = true
    },
    async doUnlinkEntityDialog(id: string) {
      this.unlinkDialog.value = false
      if (this.unlinkDialog.item && this.unlinkDialog.parent) {
        this.unlinkDialog.parent.parts = this.unlinkDialog.parent.parts.filter(part => !part.targetUri.includes(id))

        // We fetch the parent entity, as not all flows use the properly fetched entity with an etag, however we need one when updating
        const updatedElementEtag = (await this.$api.entity.fetch(this.$route.params.type, this.unlinkDialog.parent.id))
          .$etag
        if (this.unlinkDialog.parent && updatedElementEtag && !(this.unlinkDialog.parent as any).$etag) {
          // @ts-ignore
          this.unlinkDialog.parent.$etag = updatedElementEtag
        }

        this.$api.entity
          .update(this.$route.params.type, this.unlinkDialog.parent.id, this.unlinkDialog.parent)
          .then(() => {
            this.$fetch()
          })
          .catch((error: any) => {
            this.$root.$emit(VeoEvents.ALERT_ERROR, {
              title: this.$t('object_unlink_error'),
              text: JSON.stringify(error)
            })
          })
      }
    },
    doDuplicateEntity(item: IVeoEntity) {
      const newItem = item
      item.name = `${item.name} (${this.$t('clone')})`
      return this.$api.entity
        .create(this.$route.params.type, newItem)
        .then((newEntity: IVeoAPIMessage) => {
          if (this.$route.entity !== '-') {
            const existingChildren: IItem[] =
              this.currentEntity?.parts.map((part: IVeoLink) => {
                const destructedLink = part.targetUri.split('/')
                return {
                  id: destructedLink.pop() || '',
                  type: destructedLink.pop() || '',
                  name: '',
                  selected: true,
                  hidden: false
                }
              }) || []
            this.doAddEntitiesDialog(
              [
                {
                  id: newEntity.resourceId,
                  type: item.$type,
                  name: item.name,
                  selected: true,
                  hidden: false
                },
                ...existingChildren
              ],
              this.currentEntity
            ).then(() => {
              setTimeout(() => {
                this.$fetch()
              }, 50)
            })
          } else {
            setTimeout(() => {
              this.$fetch()
            }, 50)
          }

          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
            text: this.$t('object_cloned')
          })
        })
        .catch((error: any) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, {
            title: this.$t('object_duplicate_error'),
            text: JSON.stringify(error)
          })
        })
    },
    generateEntityLink(uuid: string) {
      return uuid === '-' ? '-' : `${this.objectType}-${uuid}`
    },
    loadSubEntities(_parent: any) {
      return []
    },
    sortingFunction(a: any, b: any) {
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

<style lang="scss" scoped></style>
