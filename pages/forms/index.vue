<template>
  <div>
    <template v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </template>
    <div v-if="processes.length > 0" style="max-width: 800px">
      <v-list>
        <v-subheader>PROCESSES</v-subheader>
        <v-list-item-group color="primary">
          <v-list-item v-for="process in processes" :key="process.id" :to="`/forms/07b57947-6259-471e-95cf-5970a40fac3f/${process.id}`">
            <v-list-item-content>
              <v-list-item-title class="primary--text" v-text="`${process.name}: ${process.id}`" />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>
  </div>
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
