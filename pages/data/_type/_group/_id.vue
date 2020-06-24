<template>
  <v-row no-gutters>
    <v-col class="flex-shrink-0 flex-grow-1 pa-3">
      <p v-if="$fetchState.pending">Lädt ... </p>
      <p v-if="object">
        <v-btn color="primary" :to="linkToLinks" dark>Links</v-btn>
        <v-btn color="primary" :to="linkToHistory" dark>History</v-btn>
      </p>
      <p v-if="object">
        <span>veo.data: {{ object.name }} ({{ object.id }})</span>
        <pre>{{ object }}</pre>
      </p>
      <v-dialog v-if="object" v-model="deleteDialog" persistent max-width="290">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on"
          >
            Löschen
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline" />
          <v-card-text>Soll das Objekt {{ object.name }} ({{ object.id }}) wirklich gelöscht werden?</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="deleteDialog = false">Abbrechen</v-btn>
            <v-btn text @click="deleteObject()">Löschen</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>

    <AppSideContainer :width="350">
      <nuxt-child />
    </AppSideContainer>

    <AppTabBar :items="navItems" :drawer="false" right />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import AppTabBar from '~/components/layout/AppTabBar.vue'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'

type APIGroup = 'asset' | 'control' | 'person' | 'process'

export default Vue.extend({
  middleware({ route, params, redirect }) {
    // TODO Nur weiterleiten, wenn Desktop
    if (route.name === 'data-type-group-id') {
      return redirect(`/data/${params.type}/${params.group}/${params.id}/links`)
    }
  },
  validate({ params }) {
    return ['asset', 'control', 'person', 'process'].includes(params.type)
  },
  components: {
    AppTabBar,
    AppSideContainer
  },
  props: {},
  async fetch() {
    this.object = await this.$api[this.objectType].fetch(this.$route.params.id)
  },
  data() {
    return {
      object: undefined as Object | undefined,
      deleteDialog: false as Boolean,
      navItems: [
        {
          name: 'Links',
          icon: 'mdi-link',
          to: '/data/' + this.$route.params.type + '/' + this.$route.params.group + '/' + this.$route.params.id + '/links'
        },
        {
          name: 'History',
          icon: 'mdi-history',
          to: '/data/' + this.$route.params.type + '/' + this.$route.params.group + '/' + this.$route.params.id + '/history'
        }
      ]
    }
  },
  computed: {
    objectType(): APIGroup {
      return this.$route.params.type as APIGroup
    },
    objectGroup(): String {
      return this.$route.params.group
    },
    linkToLinks(): String {
      return '/data/' + this.$route.params.type + '/' + this.$route.params.group + '/' + this.$route.params.id + '/links'
    },
    linkToHistory(): String {
      return '/data/' + this.$route.params.type + '/' + this.$route.params.group + '/' + this.$route.params.id + '/history'
    }
  },
  async created() {},
  methods: {
    async deleteObject() {
      this.deleteDialog = false
      await this.$api[this.objectType].delete(this.$route.params.id)
      this.$router.push({ path: `/data/${this.objectType}/${this.objectGroup}/` })
    }
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
