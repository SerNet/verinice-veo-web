<template>
  <v-col>
    <p>
      {{ $t('welcome') }}!
    </p>
    <p>veo.data: {{ objectType }}</p>

    <p v-if="$fetchState.pending">Lädt ... </p>

    <ul>
      <li v-for="(object, index) in objects" :key="index"><nuxt-link :to="`/data/${objectType}/-/${object.id}`">{{ `${object.name} (${object.id})` }}</nuxt-link></li>
    </ul>
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
    }
  },
  watch: {
    '$route.params.type': '$fetch'
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
