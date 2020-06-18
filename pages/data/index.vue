<template>
  <v-col>
    <p>
      {{ $t('welcome') }}!
    </p>
    veo.Data Startseite
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {
  },
  data() {
    return {
      processes: undefined as Object[] | undefined
    }
  },
  async created() {
    try {
      this.processes = await this.$api.process.fetchAll()
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
