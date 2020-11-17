<template>
  <v-col class="pa-0 fill-height overflow-hidden" style="max-height: calc(100vh - 70px);" cols="12">
    <v-row class="fill-height ma-0">
      <v-col class="pa-0" :style="{ maxHeight }" style="overflow: auto" cols="12" lg="6">
        <h1 class="ml-4 mt-2">Objektschema Editor</h1>
        <ObjectSchemaEditor v-if="schema" v-model="schema" @schema-updated="updateSchema" />
      </v-col>
      <v-col class="pa-0 fill-height" :style="{ maxHeight }" style="overflow: auto;" cols="12" lg="6">
        <CodeEditor v-model="code" />
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'

import { generateSchema } from '~/lib/ObjectSchemaHelper'

export default Vue.extend({
  data() {
    return {
      tab: 'form-schema',
      schema: undefined as VEOObjectSchemaRAW | undefined
    }
  },
  computed: {
    maxHeight(): string {
      return 'calc(100vh - ' + this.$vuetify.application.top + 'px)'
    },
    code: {
      get(): string {
        return this.schema ? JSON.stringify(this.schema, undefined, 2) : ''
      },
      set(v: string) {
        try {
          this.schema = JSON.parse(v)
        } catch (e) {}
      }
    }
  },
  mounted() {
    this.schema = generateSchema()
  },
  methods: {
    updateSchema(schema: VEOObjectSchemaRAW) {
      this.schema = undefined // We have to set it to undefined first, else the editor won't pick up the change.
      this.schema = schema
    }
  }
})
</script>

<style lang="scss" scoped></style>
