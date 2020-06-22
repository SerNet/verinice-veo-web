<template>
  <v-col>
    <p>{{ $t('welcome') }}!</p>
    <p>Hier wird ein Dashboard erstellt</p>
    <p v-if="schemaState">{{ schemaState }}</p>
    <p v-if="schemas">
      <span>Schemas:</span>
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
  async fetch() {},
  data() {
    return {
      schemaState: '',
      schemas: undefined as string[] | undefined
    }
  },
  async created() {
    this.schemaState = 'Loading available schemas...'
    try {
      this.schemas = await this.$api.schema.fetchAll().then(data => data.knownSchemas)
      this.schemaState = ''
    } catch (e) {
      this.schemaState = `Loading available schemas... FAILED: ${String(e)}`
    }
  },
  methods: {},
  head():any {
    return {
      title: 'Willkommen'
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
