<template>
  <v-list>
    <v-list-item dense class="list-header">
      <v-row dense style="font-size: 0.85em;">
        <v-col :cols="1" class="pl-8">{{ $t('unit.object.list.header.abbreviation') }}</v-col>
        <v-col :cols="3">
          {{ $t('unit.object.list.header.title') }}
        </v-col>
        <v-col :cols="5">
          {{ $t('unit.object.list.header.description') }}
        </v-col>
        <v-col :cols="2">
          {{ $t('unit.object.list.header.updatedby') }}
        </v-col>
        <v-col :cols="1">
          {{ $t('unit.object.list.header.updatedat') }}
        </v-col>
      </v-row>
    </v-list-item>
    <v-list-item dense @click="goToParent()">
      <v-row dense class="align-center">
        <v-col :cols="1" class="d-flex align-center">
          <v-icon>mdi-folder</v-icon>
        </v-col>
        <v-col :cols="10" class="list__title-col">{{ $t('parent_object') }}<br /></v-col>
        <v-col :cols="1">&nbsp;<br />&nbsp;</v-col>
      </v-row>
    </v-list-item>
    <v-list-item v-if="items.length === 0" dense>
      <v-row>
        <v-col v-if="$route.params.param === '-'" class="text-center">
          {{ $t('no_objects') }}
        </v-col>
        <v-col v-else class="text-center">
          {{ $t('no_child_objects') }} <nuxt-link :to="editItemLink">{{ $t('object_edit') }}</nuxt-link>
        </v-col>
      </v-row>
    </v-list-item>
    <v-list-item v-for="item of items" :key="item.id" dense @click="goToItem(item)">
      <v-row dense class="align-center">
        <v-col :cols="1" class="d-flex align-center">
          <v-icon v-if="item.parts.length > 0">mdi-folder</v-icon>
          <v-icon v-else>mdi-file</v-icon>
          <span>{{ item.abbreviation }}</span>
        </v-col>
        <v-col :cols="3" class="list__title-col">{{ item.name }}</v-col>
        <v-col :cols="5" class="list__description-col">{{ item.description }}</v-col>
        <v-col :cols="2">{{ item.updatedBy }}</v-col>
        <v-col :cols="1" class="list-date">
          {{
            new Date(item.updatedAt).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          }}<br />
          {{ new Date(item.updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}
        </v-col>
        <v-col :cols="1" class="list-actions flex-row justify-end align-center">
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
          <div>&nbsp;<br />&nbsp;</div>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>
<i18n>
{
  "en": {
    "clone": "Clone object",
    "delete": "Delete object",
    "edit": "Edit object",
    "no_objects": "There are no objects",
    "no_child_objects": "This object has no sub objects",
    "object_edit": "Edit this object",
    "parent_object": "Parent object"
  },
  "de": {
    "clone": "Objekt klonen",
    "delete": "Objekt löschen",
    "edit": "Objekt bearbeiten",
    "no_objects": "Es existieren keine Objekte!",
    "no_child_objects": "Dieses Objekt hat keine Unterobjekte.",
    "object_edit": "Dieses Objekt bearbeiten",
    "parent_object": "Übergeordnetes Objekt"
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
