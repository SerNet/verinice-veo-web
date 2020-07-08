<template>
  <v-col>
    <div class="display-1 mb-3">veo.data</div>
    <div class="display">Type: {{ objectType }}</div>
    <div class="display mb-3">Group: {{ objectGroup }}</div>

    <p>
      <v-dialog v-model="createDialog" persistent max-width="800">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on"> {{ objectType }} erstellen </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline" />
          <v-card-text>
            <v-text-field v-model="objectName" label="Objektname" />

            Preview des Objects:
            <pre>{{ newObject }}</pre>
            <p>{{ state }}</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="createDialog = false">Abbrechen</v-btn>
            <v-btn text @click="createObject()">Erstellen</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </p>

    <div v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </div>

    <div v-else>
      <v-list two-line max-width="500">
        <v-list-item v-for="object in objects" :key="object.id" :to="`/data/${objectType}/${objectGroup}/${object.id}`">
          <v-list-item-avatar>
            <v-icon dark class="primary">mdi-file</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="primary--text text-uppercase font-weight-medium" v-text="object.name" />
            <v-list-item-subtitle v-text="object.id" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
    <div v-if="objects.length === 0" class="display">Keine Objekte vorhanden</div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject } from '@/lib/utils'
import { GroupType } from '~/plugins/api/group'

type APIGroup = 'asset' | 'control' | 'person' | 'process'

interface IData {
  objects: IBaseObject[]
  objectName: string
  createDialog: boolean
  createdObjectUUID: string
  unitUUID: string
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
      createDialog: false,
      createdObjectUUID: '',
      unitUUID: '',
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
    newObject(): Object {
      return {
        name: this.objectName,
        owner: {
          href: `/units/${this.unitUUID}`
        }
      }
    }
  },
  watch: {
    '$route.params': '$fetch',
    createdObjectUUID: '$fetch'
  },
  async created() {
    await this.fetchUnit()
  },
  methods: {
    async createObject() {
      this.state = 'loading'
      try {
        if (this.objectType) {
          const res = await this.$api[this.objectType].create(this.newObject)
          this.createdObjectUUID = res.resourceId
          this.state = ''
          this.objectName = ''
          this.createDialog = false
        }
      } catch (error) {
        this.state = 'error: ' + error
      }
    },
    async fetchUnit() {
      try {
        const units = await this.$api.unit.fetchAll()
        if (Array.isArray(units) && units.length > 0) {
          this.unitUUID = units[0].id
        } else {
          const unit = await this.$api.unit.create({ name: 'cpmsys test Unit' })
          this.unitUUID = unit.resourceId
        }
      } catch (error) {}
    }
  },
  head(): any {
    return {
      title: 'veo.data'
    }
  }
})
</script>

<style lang="scss" scoped></style>
