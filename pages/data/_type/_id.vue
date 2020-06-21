<template>
  <v-row no-gutters>
    <v-col cols="8" class="mx-0">
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
    <v-col cols="4">
      <AppSideContainer>
        <nuxt-child />
      </AppSideContainer>
    </v-col>

    <AppTabBar :items="navItems" :drawer="true" right />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import AppTabBar from '~/components/layout/AppTabBar.vue'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'

type APIGroup = 'asset' | 'control' | 'person' | 'process' | 'unit'
// group muss noch wieder eingefügt werden

export default Vue.extend({
  validate({ params }) {
    return ['asset', 'control', 'group', 'person', 'process', 'unit'].includes(params.type)
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
    objectType(): APIGroup {
      return this.$route.params.type as APIGroup
    }
  },
  async created() {},
  methods: {
    async deleteObject() {
      this.deleteDialog = false
      await this.$api[this.objectType].delete(this.$route.params.id)
      // redirect('/data/' + this.$route.params.type)
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
