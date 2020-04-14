<template>
  <v-col style="margin: auto;">
    <p>Welcome!</p>
    <p v-if="state">{{ state }}</p>
    <p v-if="schemas">
      <ul>
        <li v-for="(schema, index) in schemas" :key="index">{{ schema }}</li>
      </ul>
    </p>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {
    this.$navigation.defaults({ left: 'tree', right: 'history' })
    this.$navigation.rightItems({
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
      state: '',
      schemas: undefined as string[] | undefined
    }
  },
  async created() {
    this.state = 'Loading available schemas...'
    try {
      this.schemas = await this.$axios.$get('/api/schemas', { headers: { Authorization: `Bearer ${this.$auth.getToken()}` } }).then(data => data.knownSchemas)
      this.state = ''
    } catch (e) {
      this.state = `Loading available schemas... FAILED: ${String(e)}`
    }
  },
  methods: {},
  head() {
    return {
      title: 'Willkommen'
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
