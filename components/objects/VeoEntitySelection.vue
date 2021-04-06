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
      <v-checkbox :value="value.some(selectedItem => selectedItem.id === item.id)" @click.prevent />
    </template>
    <template #item.abbreviation="{ item }">
      <div class="veo-object-list__abbreviation nowrap">
        <v-tooltip v-if="item.parts && item.parts.length > 0" bottom>
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
        <v-tooltip v-else-if="item.members && item.members.length > 0" bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">mdi-archive-arrow-down</v-icon>
          </template>
          <template #default>
            <span class="d-inline-block text-center">
              {{ $t('scope_children', { amount: item.members.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip v-else-if="item.members" bottom>
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
    <template #item.name="{ value }">
      <div class="veo-object-list__title">{{ value }}</div>
    </template>
    <template #item.description="{ item, value }">
      <div class="veo-object-list__description">
        <v-tooltip v-if="item.descriptionShort" bottom>
          <template #activator="{ on }">
            <span v-on="on" class="veo-object-list__abbreviation--abbreviation">{{ item.descriptionShort }}</span>
          </template>
          <template #default>
            <span>{{ value }}</span>
          </template>
        </v-tooltip>
        <span v-else>{{ value }}</span>
      </div>
    </template>
    <template #item.date="{ item }">
      <div class="veo-object-list__date nowrap">
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
    value: {
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
      type: Function as Prop<(a: IVeoEntity, b: IVeoEntity) => number>,
      default: () => ((a: IVeoEntity, b: IVeoEntity) => a.name.localeCompare(b.name))
    }
  },
  data() {
    return {
      itemsPerPage: 10
    }
  },
  computed: {
    displayedItems(): IVeoEntity[] {
      return this.items.map(item => {
        // For some reason setting a max width on a table cell gets ignored when calculating each columns width, so we have to manipulate the data
        if(item.description && item.description.length >  40) {
          item.descriptionShort = item.description.substring(0, 40) + '...'
        }
        
        return item
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
          text: this.$t('unit.object.list.header.abbreviation'),
          value: 'abbreviation',
        },
        {
          text: this.$t('unit.object.list.header.title'),
          value: 'name'
        },
        {
          text: this.$t('unit.object.list.header.description'),
          filterable: false,
          sortable: false,
          value: 'description'
        },
        {
          text: this.$t('unit.object.list.header.updatedby'),
          value: 'updatedBy',
          class: 'nowrap'
        },
        {
          align: 'end',
          text: this.$t('unit.object.list.header.updatedat'),
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
    selectItem(item: IVeoEntity) {
      let dummy = clone(this.value)

      if(dummy.some(selectedItem => selectedItem.id === item.id)) {
        dummy = dummy.filter(selectedItem => selectedItem.id !== item.id)
        this.$emit('input', dummy)
      } else {
        dummy.push({ id: item.id, type: item.type })
        this.$emit('input', dummy)
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
