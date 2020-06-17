<template>
  <v-col style="margin: auto;">
    <p v-if="process">
      <span>veo.data: {{ process.name }} ({{ process.id }})</span>
      <pre>{{ process }}</pre>
    </p>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {
    await this.$navigation.defaults({ left: 'tree', right: 'history' })
    await this.$navigation.rightItems({
      name: 'history',
      icon: 'mdi-history',
      to: '/history'
    },
    {
      name: 'links',
      icon: 'mdi-link',
      to: '/links'
    })
  },
  data() {
    return {
      process: undefined as Object | undefined
    }
  },
  async created() {
    try {
      this.process = await this.$api.process.fetch(this.$route.params.id)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  },
  methods: {},
  head():any {
    return {
      title: 'veo.data'
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
