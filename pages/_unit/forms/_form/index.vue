<template>
  <v-col cols="12">
    <div class="display-1 pt-4 pb-0">Verzeichnis der Verarbeitungstätigkeiten</div>
    <v-btn :to="`/${unit}/forms/${formId}/create`" color="primary" class="mt-12">Verarbeitungstätigkeit erstellen</v-btn>
    <div v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </div>
    <div v-else>
      <v-list two-line max-width="500">
        <v-list-item v-for="object in objects" :key="object.id" :to="`/${unit}/forms/${formId}/${object.id}`">
          <v-list-item-avatar>
            <v-icon dark class="primary">mdi-format-list-checks</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="primary--text text-uppercase font-weight-medium" v-text="object.name" />
            <v-list-item-subtitle v-text="object.id" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
    <div v-if="!$fetchState.pending && objects.length === 0" class="display">Keine Verarbeitungstätigkeiten vorhanden</div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject } from '@/lib/utils'

interface IData {
  objects: IBaseObject[]
}

export default Vue.extend({
  name: 'Forms',
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.$route.params.form)
    const objectType = formSchema.modelType.toLowerCase()
    this.objects = await this.$api[objectType].fetchAll()
  },
  data(): IData {
    return {
      objects: []
    }
  },
  computed: {
    formId() {
      return this.$route.params.form
    },
    unit() {
      return this.$route.params.unit
    }
  },
  watch: {
    '$route.params': '$fetch'
  },
  head() {
    return {
      title: 'Forms'
    }
  }
})
</script>

<style lang="scss" scoped></style>
