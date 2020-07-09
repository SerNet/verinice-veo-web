<template>
  <v-col>
    <div class="display-1 mb-10">Willkommen!</div>
    <div class="pt-6">
      <v-btn large color="primary" to="/data">
        <v-icon left>mdi-folder</v-icon>
        veo.data
      </v-btn>
      <v-btn class="ml-1" large color="primary" to="/forms">
        <v-icon left>mdi-format-list-checks</v-icon>
        veo.forms
      </v-btn>
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {},
  methods: {},
  head(): any {
    return {
      title: 'Willkommen'
    }
  }
})
</script>

<style lang="scss" scoped></style>
