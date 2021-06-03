<template>
  <div>
    <VeoEntityDisplayOptions
      :root-route="rootRoute"
      :current-entity="currentEntity"
      :hide-display-options="hideDisplayOptions"
    >
      <slot
        name="menu-bar"
        :on="on"
      />
    </VeoEntityDisplayOptions>
    <slot
      :on="on"
      :entityModifiedEvent="entityModifiedEvent"
    />
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
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { cloneDeep, upperFirst } from 'lodash';

import { IVeoEntity } from '~/types/VeoTypes';
import { getSchemaEndpoint, ISchemaEndpoint } from '~/plugins/api/schema';
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { VeoEvents } from '~/types/VeoGlobalEvents';

interface IData {
  addEntityDialog: {
    value: boolean;
    addType: 'scope' | 'entity'; // While we normally don't differentiate between scopes and entities, we use this attribute as a filter
    editedEntity?: IVeoEntity;
  };
  deleteEntityDialog: {
    value: boolean;
    item?: IVeoEntity;
  };
  unlinkEntityDialog: {
    value: boolean;
    item?: IVeoEntity;
    parent?: IVeoEntity;
  };
  createEntityDialog: {
    value: boolean;
    parent?: IVeoEntity;
  };
  on: {
    [key: string]: CallableFunction;
  };
  schemas: ISchemaEndpoint[];
  entityModifiedEvent?: IVeoEntityModifierEvent;
}

export enum VeoEntityModifierEventType {
  ADD,
  CLONE,
  DELETE,
  UNLINK
}

export interface IVeoAffectedEntity {
  uuid: string;
  type?: string;
}

export interface IVeoEntityModifierEvent {
  event: VeoEntityModifierEventType;
  affectedEntities: IVeoAffectedEntity[];
  reloadAll?: boolean;
  addToRoot?: boolean;
}

export default Vue.extend({
  props: {
    rootEntityType: {
      type: String,
      required: true
    },
    currentEntity: {
      type: Object as Prop<undefined | IVeoEntity>,
      default: undefined
    },
    rootRoute: {
      type: String,
      required: true
    },
    hideDisplayOptions: {
      type: Boolean,
      default: false
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
      on: {},
      schemas: [],
      entityModifiedEvent: undefined
    };
  },
  computed: {
    routeEnd(): string {
      const routeComponents = this.$route.path.split('/');
      return routeComponents[routeComponents.length - 1];
    },
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id;
    },
    createEntitySchemas(): { text: string; value: string }[] {
      return this.schemas.map((schema: ISchemaEndpoint) => {
        return { text: upperFirst(schema.schemaName), value: schema.schemaName };
      });
    }
  },
  mounted() {
    this.registerListeners();
  },
  methods: {
    fetchSchemas(): Promise<void> {
      return this.$api.schema.fetchAll(false, { unit: this.unitId }).then((schemas: ISchemaEndpoint[]) => {
        this.schemas = schemas;
      });
    },
    /**
     * Registers all event listeners. They either get triggered by the slot component or
     * the menu button on the top of the page.
     */
    registerListeners() {
      this.on = {
        'create-entity': (data: { type: string; parent?: IVeoEntity }) => this.onCreateEntity(data.type, data.parent),
        'create-scope': (data: { parent?: IVeoEntity }) => this.onCreateEntity('scope', data.parent),
        'add-entity': (data: { parent: IVeoEntity }) => this.showAddDialog('entity', data.parent),
        'add-scope': (data: { parent: IVeoEntity }) => this.showAddDialog('scope', data.parent),
        edit: (data: { item: IVeoEntity; path?: string }) => this.onEditEntity(data.item, data.path),
        duplicate: (data: { item: IVeoEntity; parent?: IVeoEntity }) => this.onDuplicateEntity(data.item, data.parent),
        delete: (data: { item: IVeoEntity }) => this.showDeleteEntityDialog(data.item),
        unlink: (data: { item: IVeoEntity; parent: IVeoEntity }) => this.showUnlinkEntityDialog(data.item, data.parent),
        click: (data: { item: IVeoEntity }) => this.onNavigateEntity(data.item),
        'navigate-parent': () => this.onNavigateParent()
      };
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
      if (parent && parent.type !== 'scope' && parent.type !== type) {
        throw new Error(`VeoEntityModifier::onCreateEntity: Tried creating entity of type ${type} whose parent is of type ${parent.type}`);
      }

      if (!type) {
        this.showCreateEntityDialog(parent);
        return;
      }

      this.$router.push({
        path: `${this.rootRoute}/${this.$route.params.entity}/create`,
        query: {
          based_on: type
        }
      });
    },
    /**
     * Redirects the user to the details page allowing him to edit the current entity.
     *
     * @params item If an entity is passed, the user will get redirected to the details page of that entity instead.
     * Usually used to directly edit a sub-entity.
     */
    onEditEntity(entity?: IVeoEntity, path?: string) {
      if (!path) {
        if (!entity) {
          path = `${this.rootRoute}/${this.$route.params.entity}/edit`;
        } else {
          const entityParameter = createUUIDUrlParam(entity.type, entity.id);
          path = `${this.rootRoute}/${entityParameter}/edit`;
        }
      }

      this.$router.push(path);
    },
    onNavigateEntity(item: IVeoEntity) {
      const entity = createUUIDUrlParam(item.type, item.id);
      this.$router.push(`${this.rootRoute}/${entity}/${this.routeEnd}`);
    },
    onNavigateParent() {
      this.$router.back();
    },
    onAddEntitySuccess() {
      this.addEntityDialog.value = false;
      this.entityModifiedEvent = {
        event: VeoEntityModifierEventType.ADD,
        affectedEntities: [{ uuid: this.addEntityDialog.editedEntity?.id || '' }]
      };
      this.$emit('fetch', this.entityModifiedEvent);
    },
    onAddEntityError(error: any) {
      this.$root.$emit(VeoEvents.ALERT_ERROR, {
        title: this.addEntityDialog.editedEntity?.type === 'scope' ? this.$t('scope_update_error') : this.$t('object_update_error'),
        text: JSON.stringify(error)
      });
    },
    onDeleteEntitySuccess() {
      this.deleteEntityDialog.value = false;
      this.entityModifiedEvent = {
        event: VeoEntityModifierEventType.DELETE,
        affectedEntities: [{ uuid: this.deleteEntityDialog.item?.id || '' }]
      };
      this.$emit('fetch', this.entityModifiedEvent);
    },
    onDeleteEntityError(error: any) {
      this.$root.$emit(VeoEvents.ALERT_ERROR, {
        title: this.deleteEntityDialog.item?.type === 'scope' ? this.$t('scope_delete_error') : this.$t('object_delete_error'),
        text: JSON.stringify(error)
      });
    },
    onUnlinkEntitySuccess() {
      this.unlinkEntityDialog.value = false;
      this.entityModifiedEvent = {
        event: VeoEntityModifierEventType.UNLINK,
        affectedEntities: [{ uuid: this.unlinkEntityDialog.parent?.id || '' }]
      };
      this.$emit('fetch', this.entityModifiedEvent);
    },
    onUnlinkEntityError(error: any) {
      this.$root.$emit(VeoEvents.ALERT_ERROR, {
        title: this.unlinkEntityDialog.item?.type === 'scope' ? this.$t('scope_unlink_error') : this.$t('object_unlink_error'),
        text: JSON.stringify(error)
      });
    },
    onDuplicateEntity(item: IVeoEntity, parent?: IVeoEntity) {
      const newEntity = cloneDeep(item);
      newEntity.name = `${item.name} (${this.$t('clone')})`;

      this.$api.entity
        .create(item.type, newEntity)
        .then(async (result) => {
          if (parent) {
            const fetchedParent = await this.$api.entity.fetch(parent.type, parent.id); // We have to refetch the parent in order to get an updated etag.
            if (fetchedParent.type === 'scope') {
              // @ts-ignore
              fetchedParent.members.push({
                targetUri: `/${getSchemaEndpoint(item.type)}/${result.resourceId}`
              });
            } else {
              // @ts-ignore
              fetchedParent.parts.push({
                targetUri: `/${getSchemaEndpoint(item.type)}/${result.resourceId}`
              });
            }
            this.$api.entity.update(parent.type, parent.id, fetchedParent).then(() => {
              this.entityModifiedEvent = {
                event: VeoEntityModifierEventType.CLONE,
                affectedEntities: [{ uuid: result.resourceId, type: item.type }, { uuid: parent.id }],
                addToRoot: item.type === this.rootEntityType
              };
              this.$emit('fetch', this.entityModifiedEvent);
              this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
                text: this.$t('object_cloned')
              });
            });
          } else {
            this.entityModifiedEvent = {
              event: VeoEntityModifierEventType.CLONE,
              affectedEntities: [],
              reloadAll: true
            };
            this.$emit('fetch', this.entityModifiedEvent);
          }
        })
        .catch((error: any) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, {
            title: this.$t('object_duplicate_error'),
            text: JSON.stringify(error)
          });
        });
    },
    showDeleteEntityDialog(item: IVeoEntity) {
      this.deleteEntityDialog.item = item;
      this.deleteEntityDialog.value = true;
    },
    showUnlinkEntityDialog(item: IVeoEntity, parent: IVeoEntity) {
      this.unlinkEntityDialog.item = item;
      this.unlinkEntityDialog.parent = parent;
      this.unlinkEntityDialog.value = true;
    },
    async showCreateEntityDialog(parent?: IVeoEntity) {
      if (this.schemas.length === 0) {
        await this.fetchSchemas();
      }
      this.createEntityDialog.value = true;
      this.createEntityDialog.parent = parent;
    },
    async showAddDialog(type: 'entity' | 'scope', parent: IVeoEntity) {
      if (parent) {
        this.addEntityDialog.addType = type;
        this.addEntityDialog.editedEntity = parent;
        this.addEntityDialog.value = true;
      }
    }
  }
});
</script>

<i18n>
{
  "en": {
    "clone": "Clone",
    "object_cloned": "Object cloned successfully",
    "object_delete_error": "Failed to delete object",
    "object_duplicate_error": "Failed to duplicate object",
    "object_unlink_error": "Failed to unlink object",
    "object_update_error": "Failed to update object",
    "scope_delete_error": "Failed to delete scope",
    "scope_duplicate_error": "Failed to duplicate scope",
    "scope_unlink_error": "Failed to unlink scope",
    "scope_update_error": "Failed to update scope"
  },
  "de": {
    "clone": "Klon",
    "object_cloned": "Objekt wurde geklont",
    "object_delete_error": "Objekt konnte nicht gelöscht werden",
    "object_duplicate_error": "Objekt konnte nicht erstellt werden",
    "object_unlink_error": "Verlinkung konnte nicht entfernt werden",
    "object_update_error": "Objekt konnte nicht aktualisiert werden",
    "scope_delete_error": "Scope konnte nicht gelöscht werden",
    "scope_duplicate_error": "Scope konnte nicht erstellt werden",
    "scope_unlink_error": "Verlinkung konnte nicht entfernt werden",
    "scope_update_error": "Scope konnte nicht aktualisiert werden"
  }
}
</i18n>
