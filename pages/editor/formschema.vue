<template>
  <v-col class="pa-0 fill-height overflow-hidden" style="max-height: calc(100vh - 70px);" cols="12">
    <v-row class="fill-height ma-0">
      <v-col class="pa-0" :style="{ maxHeight }" style="overflow: auto" cols="12" lg="6">
        <FormSchemaEditor :object-schema="schema" />
      </v-col>
      <v-col class="pa-0 fill-height" :style="{ maxHeight }" style="overflow: auto;" cols="12" lg="6">
        <CodeEditor v-model="code" />
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
// import preset from '~/components/editor/ObjectSchema/preset.json'
import schema from '~/components/editor/ObjectSchema/object.schema.json'

export default Vue.extend({
  data() {
    return {
      tab: 'form-schema',
      schema
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
  }
})
</script>

<style lang="scss" scoped></style>
