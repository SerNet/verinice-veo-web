<template>
  <v-col>
    <div class="display-1">Willkommen!</div>
    <div class="pt-6">
      <v-btn large color="primary" :to="`/${unit}/data`">
        <v-icon left>mdi-folder</v-icon>
        veo.data
      </v-btn>
      <v-btn class="ml-1" large color="primary" :to="`/${unit}/forms`">
        <v-icon left>mdi-format-list-checks</v-icon>
        veo.forms
      </v-btn>
    </div>
    <div class="pt-6">
      <b>Ideen:</b>
      <ul>
        <li>Widget mit Darstellung aller Objekte passend zu einem Formular (Formular Auswahl via Select darüber)</li>
        <li>Widget mit Informationen zur ausgewählten Unit</li>
        <li>Widget mit Informationen zu allen gespeicherten Objekten in dieser Unit (Type: Anzahl)</li>
      </ul>
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {},
  computed: {
    unit(): string {
      return this.$route.params.unit
    }
  },
  methods: {},
  head(): any {
    return {
      title: 'Willkommen'
    }
  }
})
</script>

<style lang="scss" scoped></style>
