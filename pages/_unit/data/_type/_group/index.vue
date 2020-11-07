<template>
  <v-col>
    <div v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </div>

    <div v-else-if="$fetchState.error">
      {{ $t('global.error.fetching') }}
    </div>

    <div v-else>
      <v-btn :to="`/${unit}/data/${objectType}/${objectGroup}/create`" color="primary" class="mt-6">{{ $t('unit.data.createobject', { type: objectType }) }}</v-btn>
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
      <div v-if="objects.length === 0" class="display">{{ $t('unit.data.noobjects') }}</div>
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
  components: {},
  validate({ params }) {
    return ['asset', 'control', 'person', 'process'].includes(params.type)
  },
  props: {},
  data(): IData {
    return {
      objects: [],
      objectName: '',
      state: ''
    }
  },
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
  head(): any {
    return {
      title: 'veo.data'
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
  methods: {}
})
</script>

<style lang="scss" scoped></style>
