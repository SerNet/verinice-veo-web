<template>
  <v-col>
    <p>
      {{ $t('welcome') }}!
    </p>
    <p>veo.Data: {{ objectType }}</p>

    <p v-if="$fetchState.pending">Lädt ... </p>

    <ul>
      <li v-for="(object, index) in objects" :key="index"><nuxt-link :to="`/data/${objectType}/${object.id}`">{{ `${object.name} (${object.id})` }}</nuxt-link></li>
    </ul>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  validate({ params }) {
    return ['asset', 'control', 'group', 'person', 'process', 'unit'].includes(params.type)
  },
  components: {},
  props: {},
  async fetch() {
    this.objects = []
    this.objects = await this.$api[this.objectType].fetchAll()
  },
  data() {
    return {
      objects: undefined as Object[] | undefined
    }
  },
  computed: {
    objectType(): string {
      return this.$route.params.type
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
