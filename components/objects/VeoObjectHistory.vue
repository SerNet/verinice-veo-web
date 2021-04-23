<template>
  <div v-if="$fetchState.pending">
    <div v-for="index in [1, 2]" :key="index" class="my-6">
      <v-skeleton-loader type="heading" />
      <v-skeleton-loader type="text" class="my-2" />
      <v-skeleton-loader type="text" />
    </div>
  </div>
  <v-list v-else>
    <div v-for="(version, index) of history" :key="version.version" >
      <v-divider v-if="index > 0" />
      <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('version') }} <b>{{ version.version }}</b>: {{ (new Date(version.time)).toLocaleString() }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ $t('by') }} <b>{{ version.author }}</b>
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            {{ $t('type') }}: {{ $t(`revisionType.${version.type}`) }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </div>
  </v-list>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import { IVeoEntity, IVeoObjectHistoryEntry } from '~/types/VeoTypes'

interface IData {
  history: IVeoObjectHistoryEntry[]
}

export default Vue.extend({
  props: {
    object: {
      type: Object as Prop<IVeoEntity>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data(): IData {
    return {
      history: []
    }
  },
  async fetch() {
    if(this.object && !this.loading) {
      this.history = (await this.$api.history.fetchVersions(this.object))
        .sort((a: IVeoObjectHistoryEntry, b: IVeoObjectHistoryEntry) => {
          return a.version > b.version ? -1 : a.version < b.version ? 1 : 0
        })
    }
  },
  watch: {
    loading(newValue: boolean) {
      if(!newValue && this.object) {
        this.$nextTick().then(() => {
          this.$fetch()
        })
      }
    }
  }
})
</script>

<i18n>
{
  "en": {
    "by": "by",
    "revisionType": {
      "CREATION": "Object created",
      "MODIFICATION": "Object modified",
      "SOFT_DELETION": "Object soft deleted"
    },
    "type": "Type",
    "version": "Version"
  },
  "de": {
    "by": "by",
    "revisionType": {
      "CREATION": "Objekt erstellt",
      "MODIFICATION": "Objekt bearbeitet",
      "SOFT_DELETION": "Objekt als gelöscht markiert"
    },
    "type": "Art",
    "version": "Version"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
