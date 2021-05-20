<template>
  <div class="pa-4 pl-0">
    <div v-if="displayedItems.length === 0">
      <span v-if="$route.params.entity === '-'" class="text-center">
        {{ $t('no_objects') }}
      </span>
      <span v-else class="text-center">
        {{ $t('no_child_objects') }} <nuxt-link :to="editItemLink">{{ $t('object_edit') }}</nuxt-link>
      </span>
    </div>
    <v-treeview
      v-else
      :active.sync="active"
      :items="displayedItems"
      :load-children="loadChildren"
      :open.sync="open"
      open-on-click
      transition
      ref="tree"
    >
      <template #prepend="{ item }">
        <v-tooltip v-if="item.entry.type !== 'scope' && item.entry.parts.length > 0" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-file-document-multiple</v-icon>
          </template>
          <template #default>
            <span class="d-inline-block text-center">
              {{ $t('object_has_subobjects') }}<br />
              {{ $t('object_has_subobjects_amount', { amount: item.entry.parts.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip v-else-if="item.entry.type === 'scope' && item.entry.members.length > 0" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-archive-arrow-down</v-icon>
          </template>
          <template #default>
            <span class="d-inline-block text-center">
              {{ $t('scope_children', { amount: item.entry.members.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip v-else-if="item.entry.type === 'scope'" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-archive</v-icon>
          </template>
          <template #default>
            <span>
              {{ $t('scope_empty') }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip v-else bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-file-document</v-icon>
          </template>
          <template #default>
            <span>
              {{ $t('object_has_no_subobjects') }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{ on }">
            <span v-on="on" class="veo-object-list__abbreviation--abbreviation">{{ item.entry.abbreviation }}</span>
          </template>
          <template #default>
            <span>{{ item.entry.abbreviation }}</span>
          </template>
        </v-tooltip>
      </template>
      <template #label="{ item }">
        <div class="tree-item d-flex justify-space-between align-center">
          <div>
            <b>{{ item.entry.name }}</b>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <span v-on="on">
                  {{ formatDate(item.entry.updatedAt) }}
                </span>
              </template>
              <template #default>
                {{ $t('created_at') }}: {{ formatDate(item.entry.createdAt) }} {{ $t('by') }} {{ item.entry.createdBy
                }}<br />
                {{ $t('updated_at') }}: {{ formatDate(item.entry.updatedAt) }} {{ $t('by') }} {{ item.entry.updatedBy }}
              </template>
            </v-tooltip>
            <span class="list__description-col ml-2">{{ item.entry.description }}</span>
          </div>
          <div class="list-actions">
            <v-tooltip bottom>
              <template #activator="tooltipOn">
                <v-menu bottom left offset-y>
                  <template v-slot:activator="menuOn">
                    <v-btn icon v-on="{ ...menuOn.on, ...tooltipOn.on }">
                      <v-icon>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <template #default>
                    <v-list>
                      <v-list-item v-if="item.type === 'scope'" @click="$emit('add-scope', { parent: item.entry })">
                        <v-list-item-title>{{ $t('scope_add') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="item.type === 'scope'" @click="$emit('create-scope', { parent: item.entry })">
                        <v-list-item-title>{{ $t('scope_create') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="$emit('add-entity', { parent: item.entry })">
                        <v-list-item-title>{{ $t('object_add') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="$emit('create-entity', { parent: item.entry })">
                        <v-list-item-title>{{ $t('object_create') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </template>
                </v-menu>
              </template>
              <template #default>
                {{ $t('object_create_subentity') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn icon @click.stop="fireEvent('edit', item)" v-on="on">
                  <v-icon>
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('edit') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn icon @click.stop="fireContextualisedEvent('duplicate', item)" v-on="on">
                  <v-icon>
                    mdi-content-copy
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('clone') }}
              </template>
            </v-tooltip>
            <v-tooltip v-if="$route.params.entity === '-'" bottom>
              <template #activator="{on}">
                <v-btn icon @click.stop="fireEvent('delete', item)" v-on="on" class="action-delete">
                  <v-icon>
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('delete') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn
                  icon
                  @click.stop="fireContextualisedEvent('unlink', item)"
                  v-on="on"
                  :class="$route.params.entity === '-' ? 'action-unlink' : ''"
                >
                  <v-icon>
                    mdi-link-off
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('unlink') }}
              </template>
            </v-tooltip>
          </div>
        </div>
      </template>
    </v-treeview>
  </div>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash'
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { formatDate, formatTime } from '~/lib/utils'
import { getSchemaEndpoint } from '~/plugins/api/schema'

import { IVeoEntity } from '~/types/VeoTypes'
import { IVeoAffectedEntity, IVeoEntityModifierEvent, VeoEntityModifierEventType } from './VeoEntityModifier.vue'

interface IData {
  open: string[]
  active: string[]
  displayedItems: ITreeEntry[]
}

export interface ITreeEntry {
  entry: IVeoEntity
  id: string
  type: string
  children?: ITreeEntry[]
}

export default Vue.extend({
  props: {
    items: {
      type: Array as Prop<IVeoEntity[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadChildren: {
      type: Function,
      default: () => (_item: (IVeoEntity) & { children: IVeoEntity[] }) => {
        return []
      }
    },
    sortingFunction: {
      type: Function as Prop<(a: ITreeEntry, b: ITreeEntry) => number>,
      default: () => (a: ITreeEntry, b: ITreeEntry) => a.entry.name.localeCompare(b.entry.name)
    },
    editItemLink: {
      type: String,
      default: ''
    },
    currentItem: {
      type: Object as Prop<IVeoEntity | undefined>,
      default: undefined
    },
    entityModifiedEvent: {
      type: Object as Prop<IVeoEntityModifierEvent | undefined>,
      default: undefined
    }
  },
  data(): IData {
    return {
      open: [],
      active: [],
      displayedItems: []
    }
  },
  watch: {
    items: {
      handler() {
        this.open = []
        this.active = []
        this.updateItemsBasedOnProp()
      },
      deep: true
    },
    entityModifiedEvent: {
      deep: true,
      immediate: true,
      handler(newValue: IVeoEntityModifierEvent) {
        if(!newValue) {
          return
        }

        switch(newValue.event) {
          case VeoEntityModifierEventType.ADD:
            this.reloadChildren(newValue.affectedEntities[0].uuid)
            break
          case VeoEntityModifierEventType.CLONE:
            if(newValue.affectedEntities[1]) {
              this.reloadChildren(newValue.affectedEntities[1].uuid)
            }
            
            if(newValue.addToRoot) {
              this.addEntityToRoot(newValue.affectedEntities[0])
            }
            break
          case VeoEntityModifierEventType.DELETE:
            this.removeEntriesWithUUID(newValue.affectedEntities[0].uuid)
            break
          case VeoEntityModifierEventType.UNLINK:
            this.reloadChildren(newValue.affectedEntities[0].uuid)
            break
        }
      }
    }
  },
  methods: {
    updateItemsBasedOnProp() {
      let id = 0

      // We have to deep clone, else changes made in updateEntityMembers will get picked up by the items watcher
      // and the tree will get reset.
      this.displayedItems = cloneDeep(this.items)
        .map((item: IVeoEntity) => {
          id++
          return this.mapEntityToTreeEntry(item, id)
        })
        .sort(this.sortingFunction)
    },
    formatDate(date: string) {
      return formatDate(new Date(date)) + ' ' + formatTime(new Date(date))
    },
    fireEvent(event: string, entry: ITreeEntry) {
      this.$emit(event, { item: entry.entry })
    },
    fireContextualisedEvent(event: string, entry: ITreeEntry) {
      this.$emit(event, { item: entry.entry, parent: this.getParent(entry.id)?.entry })
    },
    getParent(id: string): ITreeEntry | undefined {
      const parentEntries = id.split('.')
      parentEntries.pop() // Remove the last element from the array (as this is our current element and we want the parent)
      let nextId = parentEntries.shift()
      let parent = this.displayedItems.find(entry => entry.id === nextId)
      let temp = parentEntries.shift()

      while(temp) {
        if(temp) {
          nextId += '.' + temp
        }
        parent  = parent?.children?.find(entry => entry.id === nextId)
        temp = parentEntries.shift()
      }
      return parent
    },
    removeEntriesWithUUID(uuid: string, arrayToSearch?: ITreeEntry[]) {
      if(!arrayToSearch) {
        arrayToSearch = this.displayedItems
      }

      for(let i = 0; i < arrayToSearch.length; i++) {
        if(arrayToSearch[i].entry.id === uuid) {
          arrayToSearch.splice(i as any, 1);
          i-- // We have to decrease the index by one, as the next element has been inserted here.
        } else if (arrayToSearch[i].children) {
          this.removeEntriesWithUUID(uuid, arrayToSearch[i].children)

          if(arrayToSearch[i].children?.length === 0) {
            // Disabled, as this causes an issue if at the same time children are loaded. See #162
            // delete arrayToSearch[i].children
          }
        }
      }
    },
    async reloadChildren(uuid: string, arrayToSearch?: ITreeEntry[]) {
      let firstCall = false

      if(!arrayToSearch) {
        firstCall = true
        arrayToSearch = this.displayedItems
      }
      for(let index in arrayToSearch) {
        if(arrayToSearch[index].entry.id === uuid) {
          await this.loadChildren(arrayToSearch[index])

          if(arrayToSearch[index].children?.length === 0) {
            delete arrayToSearch[index].children
          }
          this.updateEntityMembers(arrayToSearch[index])
        } else if (arrayToSearch[index].children) {
          await this.reloadChildren(uuid, arrayToSearch[index].children)
        }
      }

      if(firstCall) { // We have to create a copy of the current items, else the treeview won't pick up changes in the children and update it's ui.
        const oldItems = cloneDeep(this.displayedItems)
        this.displayedItems = []
        this.displayedItems = oldItems
      }
    },
    mapEntityToTreeEntry(entity: IVeoEntity, id: number) {
      if (entity.type === 'scope' && entity.members && entity.members.length > 0) {
        return { entry: entity, children: [] as ITreeEntry[], id: '' + id, type: entity.type }
      } else if (entity.parts && entity.parts.length > 0) {
        return { entry: entity, children: [] as ITreeEntry[], id: '' + id, type: entity.type }
      } else {
        return { entry: entity, id: '' + id, type: entity.type }
      }
    },
    updateEntityMembers(updatedItem: ITreeEntry) {
      if(updatedItem.type === 'scope') {
        // @ts-ignore
        updatedItem.entry.members = updatedItem.children?.map(child => {
          return {
            targetUri: `/${getSchemaEndpoint(child.entry.type)}/${child.entry.id}`
          }
        }) || []
      } else {
        // @ts-ignore
        updatedItem.entry.parts = updatedItem.children?.map(child => {
          return {
            targetUri: `/${getSchemaEndpoint(child.entry.type)}/${child.entry.id}`
          }
        }) || []
      }
    },
    async addEntityToRoot({uuid, type}: IVeoAffectedEntity) {
      const element = await this.$api.entity.fetch(type as string, uuid)

      this.displayedItems.push(this.mapEntityToTreeEntry(element, this.displayedItems.length + 1))
    }
  },
  mounted() {
    this.updateItemsBasedOnProp()
  }
})
</script>

<i18n>
{
  "en": {
    "by": "by",
    "clone": "Clone object",
    "created_at": "Created",
    "delete": "Delete object",
    "edit": "Edit object",
    "no_objects": "There are no objects",
    "no_child_objects": "This object has no sub objects",
    "object_add": "Link object",
    "object_create": "Create child object",
    "object_create_subentity": "Add child object",
    "object_edit": "Edit this object",
    "object_has_no_subobjects": "Standard object",
    "object_has_subobjects": "Composite object",
    "object_has_subobjects_amount": "({amount} sub objects)",
    "parent_object": "Parent object",
    "scope_add": "Link scope",
    "scope_children": "Scope with members",
    "scope_create": "Create scope",
    "scope_empty": "Empty scope",
    "unlink": "Remove link",
    "updated_at": "Updated"
  },
  "de": {
    "by": "von",
    "clone": "Objekt klonen",
    "created_at": "Erstellt",
    "delete": "Objekt löschen",
    "edit": "Objekt bearbeiten",
    "no_objects": "Es existieren keine Objekte!",
    "no_child_objects": "Dieses Objekt hat keine Unterobjekte.",
    "object_add": "Objekt verknüpfen",
    "object_create": "Unterobjekt erstellen",
    "object_create_subentity": "Unterobjekt hinzufügen",
    "object_edit": "Dieses Objekt bearbeiten",
    "object_has_no_subobjects": "Standardobjekt",
    "object_has_subobjects": "Zusammengesetztes Objekt",
    "object_has_subobjects_amount": "({amount} Unterobjekte)",
    "parent_object": "Übergeordnetes Objekt",
    "scope_add": "Scope verknüpfen",
    "scope_children": "Scope mit Inhalt",
    "scope_create": "Scope erstellen",
    "scope_empty": "Scope ohne Inhalt",
    "unlink": "Verknüpfung entfernen",
    "updated_at": "Aktualisiert"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.list__description-col {
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-treeview-node__root:hover {
  .list-actions {
    display: flex;
  }

  .list-date {
    display: none;
  }
}

.list-actions {
  display: none;
}

/* Hide/show unlink or delete button, depending on whether the item is a toplevel item or not. sadly not possible with ts */
.action-unlink {
  display: none;
}

.v-treeview-node__children {
  .action-unlink {
    display: flex;
  }

  .action-delete {
    display: none;
  }
}
</style>
