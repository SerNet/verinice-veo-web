<template>
  <v-col>
    <p>
      {{ $t('welcome') }}!
    </p>
    <p>
      veo.data<br>
      type: {{ objectType }}<br>
      group: {{ objectGroup }}
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
      objects: [] as Object[]
    }
  },
  computed: {
    objectType(): APIGroup {
      return this.$route.params.type as APIGroup
    },
    objectGroup(): String {
      return this.$route.params.group
    }
  },
  watch: {
    '$route.params.type': '$fetch',
    '$route.params.group': '$fetch'
  },
  async created() {},
  methods: {
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
