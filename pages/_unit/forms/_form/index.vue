<template>
  <v-col cols="12">
    <div class="display-1 pt-4 pb-0">{{ formSchema.name }}</div>
    <template v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </template>

    <template v-else>
      <v-btn :to="`/${unit}/forms/${formId}/create`" color="primary" class="mt-6">{{ objectType }} erstellen</v-btn>
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
    </template>
    <div v-if="!$fetchState.pending && objects.length === 0" class="display">Keine Verarbeitungstätigkeiten vorhanden</div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject } from '@/lib/utils'

interface IData {
  formSchema: IBaseObject
  objectType: string
  objects: IBaseObject[]
}

export default Vue.extend({
  name: 'Forms',
  async fetch() {
    this.formSchema = await this.$api.form.fetch(this.$route.params.form)
    this.objectType = this.formSchema.modelType.toLowerCase()
    this.objects = await this.$api[this.objectType].fetchAll()
  },
  data(): IData {
    return {
      formSchema: {},
      objectType: '',
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
