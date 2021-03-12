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
    >
      <template #prepend="{ item }">
        <v-tooltip v-if="item.entry.parts && item.entry.parts.length > 0" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-file-document-multiple</v-icon>
          </template>
          <template #default>
            <span class="d-inline-block text-center">
              {{ $t('object_has_subobjects') }}<br>
              {{ $t('object_has_subobjects_amount', { amount: item.parts.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip v-else-if="item.entry.members && item.entry.members.length > 0" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-archive-arrow-down</v-icon>
          </template>
          <template #default>
            <span class="d-inline-block text-center">
              {{ $t('scope_children', { amount: item.entry.members.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip v-else-if="item.entry.members" bottom>
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
                {{ $t('created_at') }}: {{ formatDate(item.entry.createdAt) }} {{ $t('by') }} {{ item.entry.createdBy }}<br />
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
                      <v-list-item v-if="item.type === 'scope'" @click="$emit('add-scope', item.entry)">
                        <v-list-item-title>{{ $t('scope_add') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="item.type === 'scope'" @click="$emit('create-scope', item.entry)">
                        <v-list-item-title>{{ $t('scope_create') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="$emit('add-entity', item.entry)">
                        <v-list-item-title>{{ $t('object_add') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="$emit('create-entity', item.entry)">
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
                <v-btn icon @click.stop="$emit('edit', item.entry)" v-on="on">
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
                <v-btn icon @click.stop="doDuplicate(item)" v-on="on">
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
                <v-btn icon @click.stop="$emit('delete', item.entry)" v-on="on" class="action-delete">
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
                <v-btn icon @click.stop="doUnlink(item)" v-on="on"  :class="$route.params.entity === '-' ? 'action-unlink' : ''">
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
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import { IVeoEntity, IVeoScope } from '~/types/VeoTypes'

interface IData {
  deleteDialog: { value: boolean; item: IVeoScope | IVeoEntity | undefined }
  open: string[]
  active: string[]
  displayedItems: ITreeEntry[]
}

export interface ITreeEntry {
  entry: IVeoEntity
  id: string
  children?: ITreeEntry[]
}

export default Vue.extend({
  props: {
    items: {
      type: Array as Prop<(IVeoEntity | IVeoScope)[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadChildren: {
      type: Function,
      default: () => ((_item: (IVeoEntity | IVeoScope) & { children: (IVeoScope | IVeoEntity)[]}) => { return []})
    },
    sortingFunction: {
      type: Function as Prop<(a: ITreeEntry, b: ITreeEntry) => number>,
      default: () => ((a: ITreeEntry, b: ITreeEntry) => a.entry.name.localeCompare(b.entry.name))
    },
    editItemLink: {
      type: String,
      default: ''
    }
  },
  data(): IData {
    return {
      deleteDialog: { value: false, item: undefined },
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
  },
  methods: {
    updateItemsBasedOnProp() {
      let id = 0;

      this.displayedItems = this.items.map((item: IVeoEntity | IVeoScope) => {
        if (item.$type === 'scope' && (item as IVeoScope).members.length > 0) {
          return { entry: item, children: [] as ITreeEntry[], id: ''+id++, type: item.$type }
        } else if (item.parts && item.parts.length > 0) {
          return { entry: item, children: [] as ITreeEntry[], id: ''+id++, type: item.$type }
        } else {
          return { entry: item, id: ''+id++, type: item.$type }
        }
      }).sort(this.sortingFunction)
    },
    formatDate(date: string) {
      return (
        new Date(date).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) +
        ' ' +
        new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      )
    },
    doUnlink(entry: ITreeEntry) {
      this.$emit('unlink', entry.entry, this.getParent(entry.id)?.entry)
    },
    doDuplicate(entry: ITreeEntry) {
      this.$emit('duplicate', entry.entry, this.getParent(entry.id)?.entry)
    },
    getParent(id: string): ITreeEntry | undefined {
      return this.displayedItems.find((entry: ITreeEntry) => ((entry.children?.findIndex(child => child.id === id) ?? -1) > -1))
    }
  },
  mounted() {
    this.updateItemsBasedOnProp()
  }
})
</script>
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
