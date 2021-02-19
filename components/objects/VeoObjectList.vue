<template>
  <v-list>
    <v-list-item dense class="list-header">
      <v-row dense style="font-size: 0.85em;">
        <v-col :cols="1" class="pl-8">{{ $t('unit.object.list.header.abbreviation') }}</v-col>
        <v-col :cols="3">
          {{ $t('unit.object.list.header.title') }}
        </v-col>
        <v-col :cols="4">
          {{ $t('unit.object.list.header.description') }}
        </v-col>
        <v-col :cols="2">
          {{ $t('unit.object.list.header.updatedby') }}
        </v-col>
        <v-col :cols="2" class="text-right">
          {{ $t('unit.object.list.header.updatedat') }}
        </v-col>
      </v-row>
    </v-list-item>
    <v-list-item two-line dense @click="goToParent()">
      <v-row dense class="align-center">
        <v-col :cols="1" class="d-flex align-center">
          <v-icon>mdi-arrow-left</v-icon>
        </v-col>
        <v-col :cols="10" class="list__title-col">{{ $t('parent_object') }}</v-col>
        <v-col :cols="1" />
      </v-row>
    </v-list-item>
    <v-list-item v-if="items.length === 0" two-line dense>
      <v-row>
        <v-col v-if="$route.params.param === '-'" class="text-center">
          {{ $t('no_objects') }}
        </v-col>
        <v-col v-else class="text-center">
          {{ $t('no_child_objects') }} <nuxt-link :to="editItemLink">{{ $t('object_edit') }}</nuxt-link>
        </v-col>
      </v-row>
    </v-list-item>
    <v-list-item v-for="item of items" :key="item.id" two-line dense @click="goToItem(item)">
      <v-row dense class="align-center">
        <v-col :cols="1" class="d-flex align-center">
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
          <span>{{ item.abbreviation }}</span>
        </v-col>
        <v-col :cols="3" class="list__title-col">{{ item.name }}</v-col>
        <v-col :cols="4" class="list__description-col">{{ item.description }}</v-col>
        <v-col :cols="2">{{ item.updatedBy }}</v-col>
        <v-col :cols="2" class="list-date text-right">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <span v-on="on">
                {{
                  new Date(item.updatedAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                }}
                {{ new Date(item.updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </template>
            <template #default>
              {{ $t('created_at') }}:
              {{
                new Date(item.createdAt).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              }}
              {{ new Date(item.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}
              {{ $t('by') }} {{ item.createdBy }}<br />
              {{ $t('updated_at') }}:
              {{
                new Date(item.updatedAt).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              }}
              {{ new Date(item.updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}
              {{ $t('by') }} {{ item.updatedBy }}
            </template>
          </v-tooltip>
        </v-col>
        <v-col :cols="2" class="list-actions flex-row justify-end align-center">
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
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
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
  computed: {
    editItemLink(): string {
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/edit`
    }
  },
  methods: {
    goToItem(item: IVeoEntity) {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.$route.params.type}/${item.id}/list`)
    },
    goToParent() {},
    editSubItem(item: IVeoEntity) {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.$route.params.type}/${item.id}/edit`)
    }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.list__description-col {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list__title-col {
  font-weight: bold;
  white-space: nowrap;
}

.v-list-item:hover:not(.list-header) {
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
