<template>
  <v-data-table
    :items="displayedItems"
    item-key="id"
    :headers="headers"
    :items-per-page="itemsPerPage"
    :loading="loading"
    class="veo-object-list"
    @click:row="selectItem($event)"
  >
    <template #no-data>
      <span class="text-center">
        {{ $t('no_objects') }}
      </span>
    </template>
    <template #item.select="{ item }">
      <v-checkbox v-model="item.selected" @click.prevent.stop="selectItem(item)" />
    </template>
    <template #item.abbreviation="{ item }">
      <div class="veo-object-list__abbreviation nowrap">
        <v-tooltip v-if="item.entity.type !== 'scope' && item.entity.parts.length > 0" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-file-document-multiple</v-icon>
          </template>
          <template #default>
            <span class="d-inline-block text-center">
              {{ $t('object_has_subobjects') }}<br>
              {{ $t('object_has_subobjects_amount', { amount: item.entity.parts.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip v-else-if="item.entity.type === 'scope' && item.entity.members.length > 0" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-archive-arrow-down</v-icon>
          </template>
          <template #default>
            <span class="d-inline-block text-center">
              {{ $t('scope_children', { amount: item.entity.members.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip v-else-if="item.entity.type === 'scope'" bottom>
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
            <span v-on="on" class="veo-object-list__abbreviation--abbreviation">{{ item.abbreviation }}</span>
          </template>
          <template #default>
            <span>{{ item.abbreviation }}</span>
          </template>
        </v-tooltip>
      </div>
    </template>
    <template #item.name="{ item }">
      <div class="veo-object-list__title">{{ item.entity.name }}</div>
    </template>
    <template #item.description="{ item }">
      <div class="veo-object-list__description">
        <v-tooltip v-if="item.entity.descriptionShort" bottom>
          <template #activator="{ on }">
            <span v-on="on" class="veo-object-list__abbreviation--abbreviation">{{ item.entity.descriptionShort }}</span>
          </template>
          <template #default>
            <span>{{ item.entity.description }}</span>
          </template>
        </v-tooltip>
        <span v-else>{{ item.entity.description }}</span>
      </div>
    </template>
    <template #item.date="{ item }">
      <div class="veo-object-list__date nowrap">
        <v-tooltip bottom>
          <template #activator="{ on }">
            <span v-on="on">
              {{ formatDate(item.entity.updatedAt) }}
            </span>
          </template>
          <template #default>
            {{ $t('created_at') }}: {{ formatDate(item.entity.createdAt) }} {{ $t('by') }} {{ item.entity.createdBy }}<br />
            {{ $t('updated_at') }}: {{ formatDate(item.entity.updatedAt) }} {{ $t('by') }} {{ item.entity.updatedBy }}
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { clone } from 'lodash'
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import { IVeoEntity } from '~/types/VeoTypes'

export default Vue.extend({
  props: {
    selectedItems: {
      type: Array as Prop<{id: string, type: string}[]>,
      default: () => []
    },
    items: {
      type: Array as Prop<IVeoEntity[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    sortingFunction: {
      type: Function as Prop<(a: { entity: IVeoEntity, selected: boolean}, b: { entity: IVeoEntity, selected: boolean}) => number>,
      default: () => (
        (a: { entity: IVeoEntity, selected: boolean}, b: { entity: IVeoEntity, selected: boolean}) =>
          a.entity.name.localeCompare(b.entity.name)
        )
    }
  },
  data() {
    return {
      itemsPerPage: 10,
      dummy: 0
    }
  },
  computed: {
    displayedItems(): { entity: IVeoEntity, selected: boolean}[] {
      this.dummy;
      return this.items.map(item => {
        // For some reason setting a max width on a table cell gets ignored when calculating each columns width, so we have to manipulate the data
        if(item.description && item.description.length >  40) {
          item.descriptionShort = item.description.substring(0, 40) + '...'
        }
        
        return { entity: item, selected: this.selectedItems.some(selectedItem => {
          return selectedItem.id === item.id
        } )}
      }).sort(this.sortingFunction)
    },
    headers(): any[] {
      return [
        {
          filterable: false,
          sortable: false,
          text: '',
          value: 'select',
          width: 32
        },
        {
          text: this.$t('objectlist.abbreviation'),
          value: 'abbreviation',
        },
        {
          text: this.$t('objectlist.title'),
          value: 'name'
        },
        {
          text: this.$t('objectlist.description'),
          filterable: false,
          sortable: false,
          value: 'description'
        },
        {
          text: this.$t('objectlist.updatedby'),
          value: 'updatedBy',
          class: 'nowrap'
        },
        {
          align: 'end',
          text: this.$t('objectlist.updatedat'),
          value: 'date',
        }
      ]
    }
  },
  methods: {
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
    selectItem(item: { entity: IVeoEntity, selected: boolean }) {
      let dummy = clone(this.selectedItems)

      if(dummy.some(selectedItem => selectedItem.id === item.entity.id)) {
        dummy = dummy.filter(selectedItem => selectedItem.id !== item.entity.id)
        this.$emit('new-subentities', dummy)
      } else {
        dummy.push({ id: item.entity.id, type: item.entity.type })
        this.$emit('new-subentities', dummy)
      }
    }
  }
})
</script>

<i18n>
{
  "en": {
    "by": "by",
    "created_at": "Created",
    "no_objects": "There are no objects",
    "object_has_no_subobjects": "Standard object",
    "object_has_subobjects": "Composite object",
    "object_has_subobjects_amount": "({amount} sub objects)",
    "scope_children": "Scope with members",
    "scope_empty": "Empty scope",
    "updated_at": "Updated"
  },
  "de": {
    "by": "von",
    "created_at": "Erstellt",
    "no_objects": "Es existieren keine Objekte!",
    "object_has_no_subobjects": "Standardobjekt",
    "object_has_subobjects": "Zusammengesetztes Objekt",
    "object_has_subobjects_amount": "({amount} Unterobjekte)",
    "scope_children": "Scope mit Inhalt",
    "scope_empty": "Scope ohne Inhalt",
    "updated_at": "Aktualisiert"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-object-list {
  cursor: pointer;
}

.veo-object-list__abbreviation {
  display: flex;
  flex-wrap: nowrap;
  width: 65px;

  .veo-object-list__abbreviation--abbreviation {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.veo-object-list__title {
  font-weight: bold;
  white-space: nowrap;
}

.veo-object-list__description {
  overflow: hidden;
  white-space: nowrap;
}

::v-deep .nowrap {
  white-space: nowrap;
}
</style>
