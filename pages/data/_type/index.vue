<template>
  <v-col>
    <p>
      {{ $t('welcome') }}!
    </p>
    <p>veo.data: {{ objectType }}</p>

    <p v-if="$fetchState.pending">Lädt ... </p>

    <ul>
      <li v-for="(object, index) in objects" :key="index"><nuxt-link :to="`/data/${objectType}/${object.id}`">{{ `${object.name} (${object.id})` }}</nuxt-link></li>
    </ul>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

type APIGroup = 'asset' | 'control' | 'person' | 'process' | 'unit'
// group muss noch wieder eingefügt werden

export default Vue.extend({
  validate({ params }) {
    return ['asset', 'control', 'person', 'process', 'unit'].includes(params.type)
    // group muss noch wieder eingefügt werden
  },
  components: {},
  props: {},
  async fetch() {
    this.objects = []
    this.objects = await this.$api[this.objectType].fetchAll()
    // Group erstmal deaktiviert, weil das bei fetchAll noch einen type-param benötigt
  },
  data() {
    return {
      objects: undefined as Object[] | undefined
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
