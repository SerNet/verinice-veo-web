<template>
  <v-col>
    <div class="display-1 mb-3">veo.data</div>
    <div class="display">Type: {{ objectType }}</div>
    <div class="display">Group: {{ objectGroup }}</div>

    <div v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </div>

    <div v-else-if="$fetchState.error">
      Fehler beim Abruf
    </div>

    <div v-else>
      <v-btn :to="`/${unit}/data/${objectType}/${objectGroup}/create`" color="primary" class="mt-6">{{ objectType }} erstellen</v-btn>
      <v-list two-line max-width="500">
        <v-list-item v-for="object in objects" :key="object.id" :to="`/${unit}/data/${objectType}/${objectGroup}/${object.id}`">
          <v-list-item-avatar>
            <v-icon dark class="primary">mdi-file</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="primary--text text-uppercase font-weight-medium" v-text="object.name" />
            <v-list-item-subtitle v-text="object.id" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <div v-if="objects.length === 0" class="display">Keine Objekte vorhanden</div>
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject } from '~/lib/utils'
import { GroupType } from '~/plugins/api/group'

type APIGroup = 'asset' | 'control' | 'person' | 'process'

interface IData {
  objects: IBaseObject[]
  objectName: string
  state: string
}
export default Vue.extend({
  validate({ params }) {
    return ['asset', 'control', 'person', 'process'].includes(params.type)
  },
  components: {},
  props: {},
  async fetch() {
    this.objects = []

    if (this.$route.params.group === '-') {
      this.objects = await this.$api[this.objectType].fetchAll()
    } else {
      let groupType = this.$route.params.type as GroupType
      groupType = (groupType.charAt(0).toUpperCase() + groupType.slice(1)) as GroupType
      this.objects = await this.$api.group.fetchGroupMembers(this.$route.params.group, groupType)
    }
  },
  data(): IData {
    return {
      objects: [],
      objectName: '',
      state: ''
    }
  },
  computed: {
    objectType(): APIGroup {
      return this.$route.params.type as APIGroup
    },
    objectGroup(): String {
      return this.$route.params.group
    },
    unit(): String {
      return this.$route.params.unit
    }
  },
  watch: {
    '$route.params': '$fetch',
    createdObjectUUID: '$fetch'
  },
  methods: {},
  head(): any {
    return {
      title: 'veo.data'
    }
  }
})
</script>

<style lang="scss" scoped></style>
