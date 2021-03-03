<template>
  <div class="pa-4 pl-0">
    <div v-if="displayedItems.length === 0">
      <span v-if="$route.params.param === '-'" class="text-center">
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
        <v-tooltip v-if="item.parts.length > 0" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-file-document-multiple</v-icon>
          </template>
          <template #default>
            <span
              class="d-inline-block text-center"
              v-html="$t('object_has_subobjects', { amount: item.parts.length })"
            />
          </template>
        </v-tooltip>
        <v-tooltip v-else bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-file-document</v-icon>
          </template>
          <template #default>
            <span v-html="$t('object_has_no_subobjects')" />
          </template>
        </v-tooltip>
      </template>
      <template #label="{item}">
        <div class="tree-item d-flex justify-space-between align-center">
          <div>
            {{ item.abbreviation }}
            <b>{{ item.name }}</b>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <span v-on="on">
                  {{ formatDate(item.updatedAt) }}
                </span>
              </template>
              <template #default>
                {{ $t('created_at') }}: {{ formatDate(item.createdAt) }} {{ $t('by') }} {{ item.createdBy }}<br />
                {{ $t('updated_at') }}: {{ formatDate(item.updatedAt) }} {{ $t('by') }} {{ item.updatedBy }}
              </template>
            </v-tooltip>
            <span class="list__description-col ml-2">{{ item.description }}</span>
          </div>
          <div class="list-actions">
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn icon @click.stop="$emit('edit', item)" v-on="on">
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
                <v-btn icon @click.stop="$emit('duplicate', item)" v-on="on">
                  <v-icon>
                    mdi-content-copy
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('clone') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn icon @click.stop="$emit('delete', item)" v-on="on">
                  <v-icon>
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('delete') }}
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
    "object_edit": "Edit this object",
    "object_has_no_subobjects": "Standard object",
    "object_has_subobjects": "Composite object<br>({amount} sub objects)",
    "parent_object": "Parent object",
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
    "object_edit": "Dieses Objekt bearbeiten",
    "object_has_no_subobjects": "Standardobjekt",
    "object_has_subobjects": "Zusammengesetztes Objekt<br>({amount} Unterobjekte)",
    "parent_object": "Übergeordnetes Objekt",
    "updated_at": "Aktualisiert"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import { IVeoEntity } from '~/types/VeoTypes'

interface IData {
  deleteDialog: { value: boolean; item: IVeoEntity | undefined }
  open: string[]
  active: string[]
  displayedItems: (IVeoEntity & { children?: IVeoEntity[] })[]
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
      default: () => ((_item: IVeoEntity & { children: IVeoEntity[]}) => { return []})
    }
  },
  computed: {
    editItemLink(): string {
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/edit`
    }
  },
  data() {
    return {
      deleteDialog: { value: false as boolean, item: undefined as IVeoEntity | undefined },
      open: [],
      active: [],
      displayedItems: []
    } as IData
  },
  watch: {
    items() {
      this.updateItemsBasedOnProp()
    }
  },
  methods: {
    updateItemsBasedOnProp() {
      this.displayedItems = this.items.map((item: IVeoEntity) => {
        if (item.parts.length > 0) {
          return { ...item, children: [] }
        } else {
          return item
        }
      }).sort((a: IVeoEntity, b: IVeoEntity) => {
        return a.name.localeCompare(b.name)
      })
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

.tree-item:hover {
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
</style>
