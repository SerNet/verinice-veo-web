<template>
  <div>
    <v-col cols="9">
      <p v-if="object">
        <span>veo.data: {{ object.name }} ({{ object.id }})</span>
        <pre>{{ object }}</pre>
      </p>
    </v-col>

    <v-col cols="3">
      <nuxt-child />
    </v-col>

    <AppSideBar :items="navItems" :drawer="true" right />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AppSideBar from '~/components/layout/AppSideBar.vue'

export default Vue.extend({
  validate({ params }) {
    return ['asset', 'control', 'group', 'person', 'process', 'unit'].includes(params.type)
  },
  components: {
    AppSideBar
  },
  props: {},
  async fetch() {
    this.object = await this.$api[this.objectType].fetch(this.$route.params.id)
  },
  data() {
    return {
      object: undefined as Object | undefined,
      navItems: [
        {
          name: 'Links',
          icon: 'mdi-link',
          to: '/data/' + this.$route.params.type + '/' + this.$route.params.id + '/links'
        },
        {
          name: 'History',
          icon: 'mdi-history',
          to: '/data/' + this.$route.params.type + '/' + this.$route.params.id + '/history'
        }
      ]
    }
  },
  computed: {
    objectType(): string {
      return this.$route.params.type
    }
  },
  async created() {
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
