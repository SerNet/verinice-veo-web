<template>
  <v-col cols="12">
    <template v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </template>

    <template v-else>
      <v-btn :to="`/${unit}/forms/${formId}/create`" color="primary" class="mt-6">{{ $t('unit.forms.create', { type: objectType }) }}</v-btn>
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
    <div v-if="!$fetchState.pending && objects.length === 0" class="display">{{ $t('unit.forms.noprocesses') }}</div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject } from '~/lib/utils'
import { FormSchema } from '~/types/FormSchema'

interface IData {
  formSchema: FormSchema | undefined
  objectType: string | undefined
  objects: IBaseObject[]
}

export default Vue.extend({
  name: 'Forms',
  data(): IData {
    return {
      formSchema: undefined,
      objectType: '',
      objects: []
    }
  },
  async fetch() {
    this.formSchema = await this.$api.form.fetch(this.$route.params.form)
    this.objectType = this.formSchema && this.formSchema.modelType.toLowerCase()
    this.objects = this.objectType && (await this.$api[this.objectType].fetchAll())
  },
  head() {
    return {
      title: 'Forms'
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
  }
})
</script>

<style lang="scss" scoped></style>
