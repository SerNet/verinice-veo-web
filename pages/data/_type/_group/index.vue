<template>
  <v-col>
    <p>
      veo.data<br>
      type: {{ objectType }}<br>
      group: {{ objectGroup }}
    </p>

    <p>
      <v-dialog v-model="createDialog" persistent max-width="800">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on"
          >
            {{ objectType }} erstellen
          </v-btn>
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

    <p v-if="$fetchState.pending">Lädt ... </p>

    <ul>
      <li v-for="(object, index) in objects" :key="index"><nuxt-link :to="`/data/${objectType}/${objectGroup}/${object.id}`">{{ `${object.name} (${object.id})` }}</nuxt-link></li>
    </ul>
    <p v-if="!$fetchState.pending && objects.length === 0">keine Objekte vorhanden</p>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { GroupType } from '~/plugins/api/group'

type APIGroup = 'asset' | 'control' | 'person' | 'process'

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
      groupType = groupType.charAt(0).toUpperCase() + groupType.slice(1) as GroupType
      this.objects = await this.$api.group.fetchGroupMembers(this.$route.params.group, groupType)
    }
  },
  data() {
    return {
      objects: [] as Object[],
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
      } catch (error) {
      }
    }
  },
  head():any {
    return {
      title: 'veo.data'
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
