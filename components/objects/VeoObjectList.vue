<template>
  <v-data-table
    :items="items"
    item-key="id"
    :headers="headers"
    :items-per-page="itemsPerPage"
    class="veo-object-list"
    @click:row="goToItem"
  >
    <template #no-data>
      <span v-if="$route.params.param === '-'" class="text-center">
        {{ $t('no_objects') }}
      </span>
      <span v-else class="text-center">
        {{ $t('no_child_objects') }} <nuxt-link :to="editItemLink">{{ $t('object_edit') }}</nuxt-link>
      </span>
    </template>
    <template #body.prepend>
      <tr dense class="align-center" @click="goToParent()">
        <td>
          <v-icon>mdi-arrow-left</v-icon>
        </td>
        <td colspan="5">
          <i>{{ $t('parent_object') }}</i>
        </td>
      </tr>
    </template>
    <template #item.abbreviation="{ item }">
      <v-tooltip v-if="item.parts && item.parts.length > 0" bottom>
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
      <v-tooltip v-else-if="item.members && item.members.length > 0" bottom>
        <template #activator="{ on }">
          <v-icon v-on="on">mdi-archive-arrow-down</v-icon>
        </template>
        <template #default>
          <span class="d-inline-block text-center" v-html="$t('scope_children', { amount: item.members.length })" />
        </template>
      </v-tooltip>
      <v-tooltip v-else-if="item.members" bottom>
        <template #activator="{ on }">
          <v-icon v-on="on">mdi-archive</v-icon>
        </template>
        <template #default>
          <span v-html="$t('scope_empty')" />
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
      <span>{{ item.abbreviation }}</span>
    </template>
    <template #item.name="{ value }">
      <span class="veo-object-list__title">{{ value }}</span>
    </template>
    <template #item.description="{ value }">
      <span class="veo-object-list__description">{{ value }}</span>
    </template>
    <template #item.date="{ item }">
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
    </template>
    <template #item.actions="{ item }" class="text-right">
      <v-tooltip bottom>
        <template #activator="{on}">
          <v-btn icon @click.stop="editSubItem(item)" v-on="on">
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
    </template>
  </v-data-table>
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
    "scope_children": "Scope with members",
    "scope_empty": "Empty scope",
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
    "scope_children": "Scope mit Inhalt",
    "scope_empty": "Scope ohne Inhalt",
    "updated_at": "Aktualisiert"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import { IVeoEntity } from '~/types/VeoTypes'

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: ''
    },
    items: {
      type: Array as Prop<IVeoEntity[]>,
      default: () => []
    }
  },
  data() {
    return {
      itemsPerPage: 10
    }
  },
  computed: {
    editItemLink(): string {
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/edit`
    },
    headers(): any[] {
      return [
        {
          text: this.$t('unit.object.list.header.abbreviation'),
          value: 'abbreviation',
          width: 110
        },
        {
          text: this.$t('unit.object.list.header.title'),
          value: 'name'
        },
        {
          text: this.$t('unit.object.list.header.description'),
          filterable: false,
          sortable: false,
          value: 'description',
          width: 200
        },
        {
          text: this.$t('unit.object.list.header.updatedby'),
          value: 'updatedBy',
          width: 150
        },
        {
          align: 'end',
          text: this.$t('unit.object.list.header.updatedat'),
          value: 'date',
          width: 150
        },
        {
          align: 'end',
          filterable: false,
          sortable: false,
          text: '',
          value: 'actions',
          width: 150
        }
      ]
    }
  },
  methods: {
    goToItem(item: IVeoEntity) {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.$route.params.type}/${item.id}/list`)
    },
    goToParent() {
      console.log('Bla')
    },
    editSubItem(item: IVeoEntity) {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.$route.params.type}/${item.id}/edit`)
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
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-object-list {
  cursor: pointer;
}

.veo-object-list__title {
  font-weight: bold;
  white-space: nowrap;
}

.veo-object-list__description {
  display: block;
  overflow: hidden;
  max-width: 70%;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
