<template>
  <v-col>
    <h1>{{ $t('unit.index.title') }}</h1>
    <div class="pt-6">
      <v-btn large color="primary" :to="`/${unit.id}/data`">
        <v-icon left>mdi-folder</v-icon>
        veo.data
      </v-btn>
      <v-btn class="ml-1" large color="primary" :to="`/${unit.id}/forms`">
        <v-icon left>mdi-format-list-checks</v-icon>
        veo.forms
      </v-btn>
    </div>
    <div class="pt-6">
      <h2>Ideen:</h2>
      <ul>
        <li>Widget mit Darstellung aller Objekte passend zu einem Formular (Formular Auswahl via Select darüber)</li>
        <li>Widget mit Informationen zur ausgewählten Unit</li>
        <li>Widget mit Informationen zu allen gespeicherten Objekten in dieser Unit (Type: Anzahl)</li>
      </ul>
    </div>
    <div>
      <h2>Unit:</h2>
      <pre>{{ unit }}</pre>
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {
    this.unit = await this.$api.unit.fetch(this.$route.params.unit)
  },
  data() {
    return {
      unit: {}
    }
  },
  computed: {},
  watch: {
    '$route.params': '$fetch'
  },
  methods: {},
  head(): any {
    return {
      title: this.$t('welcome')
    }
  }
})
</script>

<style lang="scss" scoped></style>
