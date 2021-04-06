<template>
  <div>
    <v-row class="justify-space-between">
      <v-col cols="auto">
        <v-btn-toggle mandatory :value="activeView" color="primary" dense>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" @click="onNavigateList">
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('breadcrumbs.list_view') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" @click="onNavigateTree">
                <v-icon>mdi-file-tree</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('breadcrumbs.tree_view') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" :disabled="entityType === '-'" @click="onEditEntity">
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
          v-on="on"
          :menu-items="menuItems"
          :button-text="menuButton.text"
          :button-event="menuButton.event"
        />
      </v-col>
    </v-row>
    <slot v-bind:on="on" />
    <VeoDeleteEntityDialog
      v-model="deleteEntityDialog.value"
      v-bind="deleteEntityDialog"
      @success="onDeleteEntitySuccess"
      @error="onDeleteEntityError"
    />
    <VeoUnlinkEntityDialog
      v-model="unlinkEntityDialog.value"
      v-bind="unlinkEntityDialog"
      @success="onUnlinkEntitySuccess"
      @error="onUnlinkEntityError"
    />
    <VeoAddEntityDialog
      v-model="addEntityDialog.value"
      v-bind="addEntityDialog"
      @success="onAddEntitySuccess"
      @error="onAddEntityError"
    />
    <VeoCreateEntityDialog
      v-model="createEntityDialog.value"
      :schemas="createEntitySchemas"
      @create-entity="onCreateEntity($event, createEntityDialog.parent)"
    />
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { cloneDeep, upperFirst } from 'lodash'

import VeoDeleteEntityDialog from '~/components/objects/VeoDeleteEntityDialog.vue'
import VeoUnlinkEntityDialog from '~/components/objects/VeoUnlinkEntityDialog.vue'
import VeoAddEntityDialog from '~/components/objects/VeoAddEntityDialog.vue'
import VeoCreateEntityDialog from '~/components/objects/VeoCreateEntityDialog.vue'
import VeoMenuButton, { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import { getSchemaEndpoint, ISchemaEndpoint } from '~/plugins/api/schema'
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils'
import { VeoEvents } from '~/types/VeoGlobalEvents'

interface IData {
  addEntityDialog: {
    value: boolean
    addType: 'scope' | 'entity' // While we normally don't differentiate between scopes and entities, we use this attribute as a filter
    editedEntity?: IVeoEntity
  }
  deleteEntityDialog: {
    value: boolean
    item?: IVeoEntity
  }
  unlinkEntityDialog: {
    value: boolean
    item?: IVeoEntity
    parent?: IVeoEntity
  }
  createEntityDialog: {
    value: boolean
    parent?: IVeoEntity
  }
  on: {
    [key: string]: CallableFunction
  }
}

export default Vue.extend({
  components: {
    VeoDeleteEntityDialog,
    VeoUnlinkEntityDialog,
    VeoAddEntityDialog,
    VeoCreateEntityDialog,
    VeoMenuButton
  },
  props: {
    objects: {
      type: Array as Prop<IVeoEntity[]>,
      required: true
    },
    entities: {
      type: Array as Prop<IVeoEntity[]>,
      required: true
    },
    scopes: {
      type: Array as Prop<IVeoEntity[]>,
      required: true
    },
    schemas: {
      type: Array as Prop<ISchemaEndpoint[]>,
      required: true
    },
    currentEntity: {
      type: Object as Prop<undefined | IVeoEntity>,
      default: undefined
    },
    fetchScopes: {
      type: Function,
      default: () => () => {}
    },
    fetchEntities: {
      type: Function,
      default: () => () => {}
    },
    fetchSchemas: {
      type: Function,
      default: () => () => {}
    }
  },
  data(): IData {
    return {
      addEntityDialog: {
        editedEntity: undefined,
        addType: 'scope',
        value: false
      },
      deleteEntityDialog: {
        value: false,
        item: undefined
      },
      unlinkEntityDialog: {
        value: false,
        item: undefined,
        parent: undefined
      },
      createEntityDialog: {
        value: false,
        parent: undefined
      },
      on: {}
    }
  },
  computed: {
    activeView(): number {
      const routeComponents = this.$route.path.split('/')
      const componentName = routeComponents[routeComponents.length - 1]
      switch(componentName) {
        case 'list':
          return 0
        case 'tree':
          return 1
        default:
          return -1
      }
    },
    menuItems(): IVeoMenuButtonItem[] {
      const dummy: IVeoMenuButtonItem[] = []

      // Allow adding (linking) scopes everywhere but root level, add the possibility to add objects there too.
      if (this.entityType === 'scope') {
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
      if (this.entityType !== '-') {
        dummy.push({
          name: this.$t('object_add') as string,
          eventName: 'add-entity',
          disabled: false
        })
      }

      return dummy
    },
    menuButton(): { text: string; event: string } {
      if (this.entityType !== '-' && this.entityType !== 'scope') {
        return {
          text: this.$t('object_create').toString(),
          event: 'create-entity'
        }
      } else {
        return {
          text: this.$t('scope_create').toString(),
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
      return this.entityType || ''
    },
    formattedEntityType(): string {
      return upperFirst(this.entityType)
    },
    title(): string {
      return this.currentEntity
        ? this.currentEntity.name
        : this.entityType !== '-'
        ? this.entityId
        : this.$t('breadcrumbs.scopes').toString()
    },
    createEntitySchemas(): string[] {
      return this.schemas.map((schema: ISchemaEndpoint) => {
        return upperFirst(schema.schemaName).toString()
      })
    }
  },
  methods: {
    /**
     * Registers all event listeners. They either get triggered by the slot component or
     * the menu button on the top of the page.
     */
    registerListeners() {
      this.on = {
        'create-entity': (type?: string, parent?: IVeoEntity) => this.onCreateEntity(type, parent),
        'create-scope': (parent?: IVeoEntity) => this.onCreateEntity('scope', parent),
        'add-entity': ($event: any) => this.showAddDialog('entity', $event),
        'add-scope': ($event: any) => this.showAddDialog('scope', $event),
        edit: this.onEditEntity,
        duplicate: this.onDuplicateEntity,
        delete: this.showDeleteEntityDialog,
        unlink: this.showUnlinkEntityDialog,
        click: this.onNavigateEntity,
        'navigate-parent': this.onNavigateParent
      }
    },
    /**
     * Handles creation of new entities.
     * If no type is passed, instead of redirecting the user to the new page a dialog gets opened allowing the user to
     * specify the type of the new entity.
     * 
     * @throws Throws an error if the new entity shall be created as a child of another entity whose type is not scope and
     * has a different type than the new entity.
     */
    onCreateEntity(type?: string, parent?: IVeoEntity) {
      if(parent && parent.type !== 'scope' && parent.type !== type) {
        throw new Error(`VeoEntityModifier::onCreateEntity: Tried creating entity of type ${type} whose parent is of type ${parent.type}`)
      }

      if(!type) {
        this.showCreateEntityDialog(parent)
        return
      }

      this.$router.push({
        path: `/${this.$route.params.unit}/scopes/${createUUIDUrlParam(this.entityType, this.entityId)}/create`,
        query: {
          based_on: type
        }
      })
    },
    /**
     * Redirects the user to the details page allowing him to edit the current entity.
     * 
     * @params item If an entity is passed, the user will get redirected to the details page of that entity instead.
     * Usually used to directly edit a sub-entity.
     */
    onEditEntity(entity?: IVeoEntity) {
      if(!entity) {
        this.$router.push(`/${this.$route.params.unit}/scopes/${this.$route.params.entity}/edit`)
      } else {
        const entityParameter = createUUIDUrlParam(entity.type, entity.id)
        this.$router.push(`/${this.$route.params.unit}/scopes/${entityParameter}/edit`)
      }
    },
    onNavigateList() {
      this.$router.push(`/${this.$route.params.unit}/scopes/${this.$route.params.entity}/list`)
    },
    onNavigateTree() {
      this.$router.push(`/${this.$route.params.unit}/scopes/${this.$route.params.entity}/tree`)
    },
    onNavigateEntity(item: IVeoEntity) {
      const entity = createUUIDUrlParam(item.type, item.id)
      this.$router.push(`/${this.$route.params.unit}/scopes/${entity}/list`)
    },
    onNavigateParent() {
      this.$router.back()
    },
    onAddEntitySuccess() {
      this.addEntityDialog.value = false
    },
    onAddEntityError(error: any) {
      this.$root.$emit(VeoEvents.ALERT_ERROR, {
        title: this.addEntityDialog.editedEntity?.type === 'scope' ? this.$t('scope_update_error') : this.$t('object_update_error'),
        text: JSON.stringify(error)
      })
    },
    onDeleteEntitySuccess() {
      this.deleteEntityDialog.value = false
    },
    onDeleteEntityError(error: any) {
      this.$root.$emit(VeoEvents.ALERT_ERROR, {
        title: this.deleteEntityDialog.item?.type === 'scope' ? this.$t('scope_delete_error') : this.$t('object_delete_error'),
        text: JSON.stringify(error)
      })
    },
    onUnlinkEntitySuccess() {
      this.unlinkEntityDialog.value = false
    },
    onUnlinkEntityError(error: any) {
      this.$root.$emit(VeoEvents.ALERT_ERROR, {
        title: this.unlinkEntityDialog.item?.type === 'scope' ? this.$t('scope_unlink_error') : this.$t('object_unlink_error'),
        text: JSON.stringify(error)
      })
    },
    onDuplicateEntity(item: IVeoEntity, parent?: IVeoEntity) {
      const newEntity = cloneDeep(item)
      newEntity.name = `${item.name} (${this.$t('clone')})`

      this.$api.entity.create(item.type, newEntity).then(async (result) => {
        if(parent) {
          const fetchedParent = await this.$api.entity.fetch(parent.type, parent.id) // We have to refetch the parent in order to get an updated etag.
          if(fetchedParent.type === 'scope') {
            // @ts-ignore
            fetchedParent.members.push({
              targetUri: `/${ getSchemaEndpoint(item.type) }/${result.resourceId}`
            })
          } else {
            // @ts-ignore
            fetchedParent.parts.push({
              targetUri: `/${ getSchemaEndpoint(item.type) }/${result.resourceId}`
            })
          }
          this.$api.entity.update(parent.type, parent.id, fetchedParent).then(() => {
            this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
              text: this.$t('object_cloned')
            })
          })
        }
      }).catch((error: any) => {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('object_duplicate_error'),
          text: JSON.stringify(error)
        })
      })
    },
    showDeleteEntityDialog(item: IVeoEntity) {
      this.deleteEntityDialog.item = item
      this.deleteEntityDialog.value = true
    },
    showUnlinkEntityDialog(item: IVeoEntity, parent: IVeoEntity) {
      this.unlinkEntityDialog.item = item
      this.unlinkEntityDialog.parent = parent
      this.unlinkEntityDialog.value = true
    },
    async showCreateEntityDialog(parent?: IVeoEntity) {
      if (this.schemas.length === 0) {
        await this.fetchSchemas()
      }
      this.createEntityDialog.value = true
      this.createEntityDialog.parent = parent
    },
    async showAddDialog(type: 'entity' | 'scope', parent: IVeoEntity) {
      if (parent) {
        this.addEntityDialog.addType = type
        this.addEntityDialog.editedEntity = parent
        this.addEntityDialog.value = true
      }
    }
  },
  mounted() {
    this.registerListeners()
  }
})
</script>
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
<style lang="scss" scoped>
</style>
