<template>
  <v-col cols="12">
    <div class="display-1 pt-4 pb-0">Verzeichnis der Verarbeitungstätigkeiten</div>
    <v-btn to="/forms/07b57947-6259-471e-95cf-5970a40fac3f/" color="primary" class="mt-4">Verarbeitungstätigkeit erstellen</v-btn>
    <div v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </div>
    <div v-else>
      <v-list two-line max-width="500">
        <v-list-item-group color="primary">
          <v-list-item v-for="process in processes" :key="process.id" :to="`/forms/07b57947-6259-471e-95cf-5970a40fac3f/${process.id}`">
            <v-list-item-avatar>
              <v-icon dark class="primary">mdi-clipboard-text</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="primary--text text-uppercase font-weight-medium" v-text="process.name" />
              <v-list-item-subtitle v-text="process.id" />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>
  </v-col>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'Forms',
  async fetch() {
    this.processes = await this.$api.process.fetchAll()
  },
  data() {
    return {
      processes: []
    }
  },
  head() {
    return {
      title: 'Forms'
    }
  }
})
</script>

<style lang="scss" scoped></style>
