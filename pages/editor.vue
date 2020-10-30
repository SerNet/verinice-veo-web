<template>
  <v-col class="pa-0 fill-height" cols="12">
    <portal to="footer">
      <v-tabs v-model="tab" centered>
        <v-tabs-slider />
        <v-tab href="#object-schema">Objekt-Schema</v-tab>
        <v-tab href="#form-schema">Form-Schema</v-tab>
      </v-tabs>
    </portal>
    <v-tabs-items v-model="tab" class="fill-height" style="padding-bottom: 46px">
      <v-tab-item value="object-schema" class="fill-height">
        <v-row class="fill-height ma-0">
          <v-col class="pa-0" :style="{ maxHeight }" style="overflow: auto" cols="12" lg="6">
            <ObjectSchemaEditor v-model="schema" />
          </v-col>
          <v-col class="pa-0 fill-height" :style="{ maxHeight }" style="overflow: auto;" cols="12" lg="6">
            <CodeEditor v-model="code" />
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item value="form-schema">
        FormSchemaEditor
      </v-tab-item>
    </v-tabs-items>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import schema from '~/components/editor/ObjectSchema/object.schema.json'

export default Vue.extend({
  components: {},
  props: {},
  data() {
    return {
      tab: 'object-schema',
      schema
    }
  },
  async fetch() {},
  head() {
    return {
      // title: ''
    }
  },
  computed: {
    maxHeight(): string {
      return 'calc(100vh - ' + this.$vuetify.application.top + 'px - 48px)'
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
  methods: {}
})
</script>

<style lang="scss" scoped></style>
