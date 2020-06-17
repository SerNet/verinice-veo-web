<template>
  <v-col style="margin: auto;">
    <p>{{ $t('welcome') }}!</p>
    <p v-if="processes">
      <span>VDV (Prozesse):</span>
      <ul>
        <li v-for="(process, index) in processes" :key="index"><nuxt-link :to="`/data/process/${process.id}`">{{ `${process.name} (${process.id})` }}</nuxt-link></li>
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
