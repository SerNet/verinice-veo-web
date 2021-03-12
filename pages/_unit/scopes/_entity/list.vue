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
              <v-btn v-on="on" :disabled="entityType === '-'" @click="navigateDetails()">
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
          :button-text="menuButton.text"
          :button-event="menuButton.event"
          @create-entity="navigateCreate()"
          @add-entity="showAddDialog('entities', $event)"
          @create-scope="showCreateScopeDialog()"
          @add-scope="showAddDialog('scopes', $event)"
        />
      </v-col>
    </v-row>
    <component
      :is="component"
      :items="objects"
      :loading="$fetchState.pending"
      :show-parent-link="showParentLink"
      :load-children="loadSubEntities"
      :sorting-function="sortingFunction"
      :edit-item-link="editItemLink"
      @duplicate="doDuplicate"
      @delete="showDeleteEntityDialog"
      @edit="navigateSubEntityDetails"
      @unlink="showUnlinkEntityDialog"
      @parent="navigateParent"
      @click="navigateSubEntity"
      @create-entity="navigateCreate($event)"
      @add-entity="showAddDialog('entities', $event)"
      @create-scope="showCreateScopeDialog($event)"
      @add-scope="showAddDialog('scopes', $event)"
    />
    <VeoDeleteEntityDialog v-model="deleteDialog.value" v-bind="deleteDialog" @delete="doDeleteDialog" />
    <VeoUnlinkEntityDialog v-model="unlinkDialog.value" v-bind="unlinkDialog" @unlink="doUnlinkDialog" />
    <VeoAddEntityDialog
      v-model="addDialog.value"
      v-bind="addDialog"
      @add-entities="doAddDialog"
      @add-scopes="doAddDialog"
    />
    <VeoCreateScopeDialog v-model="createScopeDialog.value" @create-scope="doCreateScope" />
    <VeoCreateEntityDialog v-model="createEntityDialog.value" :schemas="createEntitySchemas" @create-entity="doCreateEntityDialog" />
  </VeoPage>
</template>
<i18n>
{
  "en": {
    "clone": "Clone",
    "object_add": "Link object",
    "object_cloned": "Object cloned successfully",
    "object_create": "Create object",
    "object_delete_error": "Failed to delete object",
    "object_duplicate_error": "Failed to duplicate object",
    "object_unlink_error": "Failed to unlink object",
    "object_update_error": "Failed to update object",
    "scope_add": "Link scope",
    "scope_create": "Create scope",
    "scope_delete_error": "Failed to delete scope",
    "scope_duplicate_error": "Failed to duplicate scope",
    "scope_unlink_error": "Failed to unlink scope",
    "scope_update_error": "Failed to update scope"
  },
  "de": {
    "clone": "Klon",
    "object_add": "Objekt verknüpfen",
    "object_cloned": "Objekt wurde geklont",
    "object_create": "Objekt erstellen",
    "object_delete_error": "Objekt konnte nicht gelöscht werden",
    "object_duplicate_error": "Objekt konnte nicht erstellt werden",
    "object_unlink_error": "Verlinkung konnte nicht entfernt werden",
    "object_update_error": "Objekt konnte nicht aktualisiert werden",
    "scope_add": "Scope verknüpfen",
    "scope_cloned": "Scope wurde geklont",
    "scope_create": "Scope erstellen",
    "scope_delete_error": "Scope konnte nicht gelöscht werden",
    "scope_duplicate_error": "Scope konnte nicht erstellt werden",
    "scope_unlink_error": "Verlinkung konnte nicht entfernt werden",
    "scope_update_error": "Scope konnte nicht aktualisiert werden"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { capitalize, upperFirst } from 'lodash'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectList from '~/components/objects/VeoObjectList.vue'
import VeoMenuButton, { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import { IVeoAPIMessage, IVeoEntity, IVeoLink, IVeoScope } from '~/types/VeoTypes'
import VeoDeleteEntityDialog from '~/components/objects/VeoDeleteEntityDialog.vue'
import VeoUnlinkEntityDialog from '~/components/objects/VeoUnlinkEntityDialog.vue'
import VeoAddEntityDialog, { IItem } from '~/components/objects/VeoAddEntityDialog.vue'
import VeoCreateEntityDialog from '~/components/objects/VeoCreateEntityDialog.vue'
import VeoCreateScopeDialog from '~/components/objects/VeoCreateScopeDialog.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaEndpoint, ISchemaEndpoint } from '~/plugins/api/schema'
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils'

interface IData {
  objects: (IVeoEntity | IVeoScope)[]
  addDialog: {
    value: boolean
    items: IItem[]
    editedItem?: IVeoEntity | IVeoScope
    eventName: string
  }
  deleteDialog: {
    value: boolean
    item: undefined | IVeoEntity | IVeoScope
  }
  unlinkDialog: {
    value: boolean
    item: undefined | IVeoEntity | IVeoScope
    parent: undefined | IVeoEntity | IVeoScope
  }
  currentEntity: undefined | IVeoEntity | IVeoScope
  entities: IVeoEntity[]
  scopes: IVeoScope[]
  showParentLink: boolean
  activeView: number
  createScopeDialog: {
    value: boolean
    parent?: IVeoEntity
  }
  createEntityDialog: {
    value: boolean
    parent?: IVeoEntity
  }
  component: any
  schemas: ISchemaEndpoint[]
}

export default Vue.extend({
  name: 'VeoObjectsListPage',
  components: {
    VeoPage,
    VeoObjectList,
    VeoMenuButton,
    VeoDeleteEntityDialog,
    VeoUnlinkEntityDialog,
    VeoAddEntityDialog,
    VeoCreateScopeDialog,
    VeoCreateEntityDialog
  },
  head(): any {
    return {
      title: `${this.title} - ${this.$t('breadcrumbs.scopes')}`
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
      currentEntity: undefined,
      entities: [],
      showParentLink: false,
      component: VeoObjectList,
      activeView: 0,
      createScopeDialog: {
        value: false,
        parent: undefined
      },
      createEntityDialog: {
        value: false,
        parent: undefined
      },
      scopes: [],
      schemas: []
    }
  },
  asyncData({from, route}) {
    // Super dirty fix in order to allow navigation to parent object if the user clicked on a child previously.
    // For some reason the page gets recreated completely, rendering beforeRouteUpdate and watch $route completely useless
    return {
      showParentLink: route.name === from.name && route.path !== from.path && route.params.entity !== '-'
    }
  },
  async fetch() {
    if (this.entityType === '-') {
      this.objects = await this.$api.scope.fetchAll({
        unit: this.unitId
      })
      this.currentEntity = undefined
    } else if(this.entityType === 'scope') {
      this.objects = await this.$api.scope.fetchScopeMembers(this.entityId)
      this.currentEntity = await this.$api.scope.fetch(this.entityId)
    } else {
      this.objects = await this.$api.entity.fetchSubEntities(this.entityEndpoint, this.entityId)
      this.currentEntity = await this.$api.entity.fetch(this.entityEndpoint, this.entityId)
    }
  },
  computed: {
    menuItems(): IVeoMenuButtonItem[] {
      const dummy: IVeoMenuButtonItem[] = []

      // Allow adding (linking) scopes everywhere but root level, add the possibility to add objects there too.
      if(this.entityType === 'scope') {
        dummy.push({
          name: this.$t('scope_add') as string,
          eventName: 'add-scope',
          disabled: false
        })

        // Only add the entity create button if the user is in a scope, as it is the primary choice in entities
        dummy.push({
          name: this.$t('object_create') as string,
          eventName: 'create-entity',
          disabled: false
        })
      }

      // Allow entity management on all levels but the root level
      if(this.entityType !== '-') {
        dummy.push({
          name: this.$t('object_add') as string,
          eventName: 'add-entity',
          disabled: false
        })
      }

      return dummy
    },
    menuButton(): { text: string, event: string } {
      if(this.entityType !== '-' && this.entityType !== 'scope') {
        return {
          text: this.$t('object_create'),
          event: 'create-entity'
        }
      } else {
        return {
          text: this.$t('scope_create'),
          event: 'create-scope'
        }
      }
    },
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    entityId(): string {
      return separateUUIDParam(this.$route.params.entity).id
    },
    entityType(): string {
      return separateUUIDParam(this.$route.params.entity).type
    },
    entityEndpoint(): string {
      return getSchemaEndpoint(this.entityType) || ''
    },
    formattedEntityType(): string {
      return capitalize(this.entityType)
    },
    title(): string {
      return this.currentEntity ? this.currentEntity.name : this.entityType !== '-' ? this.entityId : this.$t('breadcrumbs.scopes')
    },
    editItemLink(): string {
      return `/${this.$route.params.unit}/scopes/${this.$route.params.entity}/edit`
    },
    createEntitySchemas(): string[] {
      return this.schemas.map((schema: ISchemaEndpoint) => {
        return upperFirst(schema.schemaName).toString()
      })
    }
  },
  methods: {
    navigateList() {
      this.$router.push(
        `/${this.$route.params.unit}/scopes/${this.$route.params.entity}/list`
      )
    },
    navigateTree() {
      this.$router.push(
        `/${this.$route.params.unit}/scopes/${this.$route.params.entity}/tree`
      )
    },
    navigateDetails() {
      this.$router.push(
        this.editItemLink
      )
    },
    navigateCreate(parent?: IVeoEntity | IVeoScope, objectType?: string) {
      const parentType = parent?.$type || this.entityType
      const parentId = parent?.id || this.entityId

      // If the user is viewing a scope and wants to create an entity, he has to specify a type first
      if(parentType === 'scope' && !objectType) {
        this.showCreateEntityDialog(parent)
      } else {
        if(!objectType) {
          objectType = upperFirst(parentType)
        }
        this.$router.push({
          path: `/${this.$route.params.unit}/scopes/${createUUIDUrlParam(parentType, parentId)}/create`,
          query: {
            based_on: objectType
          }
        })
      }
    },
    navigateSubEntity(item: IVeoEntity | IVeoScope) {
      this.$router.push({
        params: {
          entity: createUUIDUrlParam(item.$type, item.id)
        }
      })
    },
    navigateSubEntityDetails(item: IVeoEntity | IVeoScope) {
      this.$router.push(`/${this.$route.params.unit}/scopes/${createUUIDUrlParam(item.$type, item.id)}/edit`)
    },
    navigateParent() {
      this.$router.back()
    },
    async fetchScopes() {
      return this.$api.scope.fetchAll({ unit: this.unitId }).then((scopes: IVeoScope[]) => {
        this.scopes = scopes
      })
    },
    async fetchEntities() {
      switch(this.entityType) {
        case '-':
        case 'scope':
          if(this.schemas.length === 0) {
            await this.fetchSchemas()
          }

          for(const schema of this.schemas) {
            if(schema) {
              this.entities.push(...(await this.$api.entity.fetchAll(schema.endpoint, { unit: this.unitId })))
            }
          }
          break
        default:
          return this.entities = await this.$api.entity.fetchAll(this.entityEndpoint, { unit: this.unitId })
      }
    },
    async fetchSchemas() {
      return this.$api.schema.fetchAll({ unit: this.unitId }).then((schemas: ISchemaEndpoint[]) => {
        this.schemas = schemas
      })
    },
    async showCreateEntityDialog(parent?: IVeoEntity) {
      if(this.schemas.length === 0) {
        await this.fetchSchemas()
      }
      this.createEntityDialog.value = true
      this.createEntityDialog.parent = parent
    },
    doCreateEntityDialog(type?: string) {
      this.navigateCreate(this.createEntityDialog.parent, type)
    },
    showCreateScopeDialog(parent?: IVeoEntity) {
      this.createScopeDialog.value = true
      this.createScopeDialog.parent = parent
    },
    doCreateScope(scope: IVeoScope) {
      this.$api.scope
        .create({
          ...scope,
          owner: {
            targetUri: `/units/${this.unitId}`
          }
        })
        .then(async (data: IVeoAPIMessage) => {
          const parentId = this.createScopeDialog.parent?.id || this.entityId
          if (parentId !== '-') {
            const parent = await this.$api.scope.fetch(parentId)
            parent.members.push({
              targetUri: `${this.$config.apiUrl}/scopes/${data.resourceId}`
            } as any)
            this.$api.scope.update(parent.id, parent).then(() => {
              this.$fetch()
              this.createScopeDialog.value = false
            })
          } else {
            this.$fetch()
            this.createScopeDialog.value = false
          }
        })
    },
    async showAddDialog(type: 'entities' | 'scopes', item?: IVeoEntity) {
      let currentItem
      if(item) {
        currentItem = item
      } else {
        currentItem = this.currentEntity
      }

      if(currentItem) {
        if(type === 'scopes') {
          if (this.scopes.length === 0) {
            await this.fetchScopes()
          }

          this.addDialog.items = this.scopes.map(scope => {
            return {
              id: scope.id,
              type: scope.$type,
              name: scope.name,
              hidden: false,
              selected: false
            }
          })
        } else {
          await this.fetchEntities()

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
        if(currentItem.$type === 'scope') {
          links = (currentItem as IVeoScope).members
        } else {
          links = (currentItem as IVeoEntity).parts
        }

        for(const link of links) {
          const destructedLink = link.targetUri.split('/')
          const id = destructedLink.pop() || ''
          const type = destructedLink.pop() || ''

          const itemIndex = this.addDialog.items.findIndex(item => item.id === id)

          // If the item exists, simply set its selected value to true. Else the item is a scope.
          // To avoid an api call, we simply take the values from the existing link
          if(itemIndex >= 0) {
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
        this.addDialog.eventName = type === 'scopes' ? 'add-scopes' : 'add-entities'
        this.addDialog.value = true
      }
    },
    doAddDialog(entities: IItem[], parent?: IVeoEntity | IVeoScope) {
      const _parent: IVeoScope | IVeoEntity | undefined = parent || this.addDialog.editedItem

      if(_parent?.$type === 'scope') {
        this.doAddScopeMembers(entities, _parent as IVeoScope)
      } else {
        this.doAddEntityChildren(entities, _parent as IVeoEntity)
      }
    },
    async doAddScopeMembers(entities: IItem[], parent: IVeoScope) {
      if(parent) {
        const children = entities.map((_entity) => {
          _entity.type = _entity.type === 'scope' ? 'scopes' : _entity.type
          return {
            targetUri: `/${_entity.type}/${_entity.id}`
          }
        })

        // We fetch the parent entity, as not all flows use the properly fetched entity with an etag, however we need one when updating
        // @ts-ignore
        parent.members = children
        const updatedElementEtag = (await this.$api.scope.fetch(parent.id)).$etag

        if(parent && updatedElementEtag && !(parent as any).$etag) {
          // @ts-ignore
          parent.$etag = updatedElementEtag
        }
        this.$api.scope.update(parent.id, parent).catch((error: any) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, {
            title: this.$t('scope_update_error'),
            text: JSON.stringify(error)
          })
        }).finally(() => {
          this.addDialog.value = false
          this.$fetch()
        })
      }
    },
    async doAddEntityChildren(entities: IItem[], parent: IVeoEntity) {
      if(parent) {
        const children = entities.map((_entity) => {
          _entity.type = _entity.type === 'scope' ? 'scopes' : _entity.type
          return {
            targetUri: `/${_entity.type}/${_entity.id}`
          }
        })

        // We fetch the parent entity, as not all flows use the properly fetched entity with an etag, however we need one when updating
        // @ts-ignore
        parent.parts = children
        const updatedElementEtag = (await this.$api.entity.fetch(parent.$type, parent.id)).$etag
        if(parent && updatedElementEtag && !(parent as any).$etag) {
          // @ts-ignore
          entity.$etag = updatedElementEtag
        }
        this.$api.entity.update(parent.$type, parent?.id, parent).catch((error: any) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, {
            title: this.$t('object_update_error'),
            text: JSON.stringify(error)
          })
        }).finally(() => {
          this.addDialog.value = false
          this.$fetch()
        })
      }
    },
    showDeleteEntityDialog(item: IVeoEntity | IVeoScope) {
      this.deleteDialog.item = item
      this.deleteDialog.value = true
    },
    doDeleteDialog(id: string) {
      if(this.deleteDialog.item) {
        if(this.deleteDialog.item.$type === 'scope') {
          this.doDeleteScope(id)
        } else {
          this.doDeleteEntity(id)
        }
      }
    },
    doDeleteEntity(id: string) {
      this.deleteDialog.value = false
      this.$api.entity.delete(this.deleteDialog.item?.$type, id).then(() => {
        this.$fetch()
      }).catch((error: any) => {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('object_delete_error'),
          text: JSON.stringify(error)
        })
      })
    },
    doDeleteScope(id: string) {
      this.deleteDialog.value = false
      this.$api.scope.delete(id).then(() => {
        this.$fetch()
      }).catch((error: any) => {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('scope_delete_error'),
          text: JSON.stringify(error)
        })
      })
    },
    showUnlinkEntityDialog(item: IVeoEntity | IVeoScope, parent?: IVeoEntity | IVeoScope) {
      this.unlinkDialog.item = item
      this.unlinkDialog.parent = parent || this.currentEntity
      this.unlinkDialog.value = true
    },
    doUnlinkDialog(id: string) {
      if(this.unlinkDialog.item && this.unlinkDialog.parent) {
        if(this.unlinkDialog.parent.$type === 'scope') {
          this.doUnlinkScope(id)
        } else {
          this.doUnlinkEntity(id)
        }
      }
    },
    async doUnlinkEntity(id: string) {
      this.unlinkDialog.value = false
      if(this.unlinkDialog.item && this.unlinkDialog.parent) {
        this.unlinkDialog.parent.parts = this.unlinkDialog.parent.parts.filter(part => !part.targetUri.includes(id))

        // We fetch the parent entity, as not all flows use the properly fetched entity with an etag, however we need one when updating
        const updatedElementEtag = (await this.$api.entity.fetch(this.unlinkDialog.parent.$type, this.unlinkDialog.parent.id)).$etag
        if(this.unlinkDialog.parent && updatedElementEtag && !(this.unlinkDialog.parent as any).$etag) {
          // @ts-ignore
          this.unlinkDialog.parent.$etag = updatedElementEtag
        }

        this.$api.entity.update(this.unlinkDialog.parent.$type, this.unlinkDialog.parent.id, this.unlinkDialog.parent).then(() => {
          this.$fetch()
        }).catch((error: any) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, {
            title: this.$t('object_unlink_error'),
            text: JSON.stringify(error)
          })
        })
      }
    },
    async doUnlinkScope(id: string) {
      this.unlinkDialog.value = false
      if(this.unlinkDialog.item && this.unlinkDialog.parent) {
        (this.unlinkDialog.parent as IVeoScope).members = (this.unlinkDialog.parent as IVeoScope).members.filter(member => !member.targetUri.includes(id))

        // We fetch the parent entity, as not all flows use the properly fetched entity with an etag, however we need one when updating
        const updatedElementEtag = (await this.$api.scope.fetch(this.unlinkDialog.parent.id)).$etag
        if(this.unlinkDialog.parent && updatedElementEtag && !(this.unlinkDialog.parent as any).$etag) {
          // @ts-ignore
          this.unlinkDialog.parent.$etag = updatedElementEtag
        }

        this.$api.scope.update(this.unlinkDialog.parent.id, this.unlinkDialog.parent).then(() => {
          this.$fetch()
        }).catch((error: any) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, {
            title: this.$t('object_unlink_error'),
            text: JSON.stringify(error)
          })
        })
      }
    },
    doDuplicate(item: IVeoEntity | IVeoScope, parent?: IVeoEntity) {
      if(item.$type === 'scope') {
        this.doDuplicateScope(item as IVeoScope, parent)
      } else {
        this.doDuplicateEntity(item as IVeoEntity, parent)
      }
    },
    doDuplicateEntity(item: IVeoEntity, parentItem?: IVeoEntity) {
      const newItem = item
      const parent = parentItem || this.currentEntity as undefined | IVeoEntity | IVeoScope

      item.name = `${item.name} (${this.$t('clone')})`
      return this.$api.entity.create(getSchemaEndpoint(newItem.$type), newItem).then((newEntity: IVeoAPIMessage) => {
        if(parent && this.$route.entity !== '-') {
          if(parent.$type === 'scope') {
            const existingChildren = this.getScopeMembersAsItem(parent as IVeoScope)
            this.doAddScopeMembers([{
              id: newEntity.resourceId,
              type: getSchemaEndpoint(item.$type) || '',
              name: item.name,
              selected: true,
              hidden: false
            }, ...existingChildren], parent as IVeoScope).then(() => {
              setTimeout(() =>  {
                this.$fetch()
              }, 50)
            })
          } else {
            const existingChildren = this.getEntityChildrenAsItem(parent as IVeoEntity)
            this.doAddEntityChildren([{
              id: newEntity.resourceId,
              type: item.$type,
              name: item.name,
              selected: true,
              hidden: false
            }, ...existingChildren], parent as IVeoEntity).then(() => {
              setTimeout(() =>  {
                this.$fetch()
              }, 50)
            })
          }
        } else {
          setTimeout(() =>  {
            this.$fetch()
          }, 50)
        }

        this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
          text: this.$t('object_cloned')
        })
      }).catch((error: any) => {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('object_duplicate_error'),
          text: JSON.stringify(error)
        })
      })
    },
    doDuplicateScope(item: IVeoScope, parentItem?: IVeoEntity) {
      const newItem = item
      const parent = parentItem || this.currentEntity as undefined | IVeoEntity | IVeoScope
      item.name = `${item.name} (${this.$t('clone')})`
      return this.$api.scope.create(newItem).then((newEntity: IVeoAPIMessage) => {
        if(parent && this.$route.entity !== '-') {
          if(parent.$type === 'scope') {
            const existingChildren = this.getScopeMembersAsItem(parent as IVeoScope)
            this.doAddScopeMembers([{
              id: newEntity.resourceId,
              type: item.$type,
              name: item.name,
              selected: true,
              hidden: false
            }, ...existingChildren], parent as IVeoScope).then(() => {
              setTimeout(() =>  {
                this.$fetch()
              }, 50)
            })
          } else {
            const existingChildren = this.getEntityChildrenAsItem(parent as IVeoEntity)
            this.doAddEntityChildren([{
              id: newEntity.resourceId,
              type: item.$type,
              name: item.name,
              selected: true,
              hidden: false
            }, ...existingChildren], parent as IVeoEntity).then(() => {
              setTimeout(() =>  {
                this.$fetch()
              }, 50)
            })
          }
        } else {
          setTimeout(() =>  {
            this.$fetch()
          }, 50)
        }

        this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
          text: this.$t('scope_cloned')
        })
      }).catch((error: any) => {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('scope_duplicate_error'),
          text: JSON.stringify(error)
        })
      })
    },
    loadSubEntities(_parent: any) {
      return []
    },
    sortingFunction(a: any, b: any) {
      if(a.members && !b.members) {
        return -1
      } else if (!a.members && b.members) {
        return 1
      } else if(a.parts && b.parts) {
        if(a.parts.length > 0 && b.parts.length === 0) {
          return -1
        } else if (a.parts.length === 0 && b.parts.length > 0) {
          return 1
        }
      } else {
        return a.name.localeCompare(b.name)
      }
    },
    getScopeMembersAsItem(scope: IVeoScope): IItem[] {
      return scope.members.map((part: IVeoLink) => {
        const destructedLink = part.targetUri.split('/')
        return {
          id: destructedLink.pop() || '',
          type: destructedLink.pop() || '',
          name: '',
          selected: true,
          hidden: false
        }
      }) || []
    },
    getEntityChildrenAsItem(scope: IVeoEntity): IItem[] {
      return scope.parts.map((part: IVeoLink) => {
        const destructedLink = part.targetUri.split('/')
        return {
          id: destructedLink.pop() || '',
          type: destructedLink.pop() || '',
          name: '',
          selected: true,
          hidden: false
        }
      }) || []
    }
  }
})
</script>

<style lang="scss" scoped></style>
