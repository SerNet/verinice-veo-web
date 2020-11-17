<template>
  <v-col class="pa-0 fill-height overflow-hidden" style="max-height: calc(100vh - 70px);" cols="12">
    <v-row class="fill-height ma-0">
      <v-col class="pa-0" :style="{ maxHeight }" style="overflow: auto; position: relative;" cols="12" :lg="collapsed ? 12 : 6">
        <div class="veo-collapse-editor pa-1">
          <v-btn icon @click="collapsed = !collapsed">
            <v-icon v-if="collapsed">mdi-chevron-left</v-icon>
            <v-icon v-else>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
        <v-row no-gutters class="flex-column align-center">
          <v-col :cols="collapsed ? 8 : 12">
            <h1 class="ml-4 mt-2">Objektschema Editor</h1>
          </v-col>
          <v-col :cols="collapsed ? 8 : 12">
            <ObjectSchemaEditor v-if="schema" v-model="schema" @schema-updated="updateSchema" />
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if="!collapsed" class="pa-0 fill-height" :style="{ maxHeight }" style="overflow: auto;" cols="12" lg="6">
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
      collapsed: false as boolean,
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

<style lang="scss" scoped>
.veo-collapse-editor {
  background-color: rgb(245, 245, 245);
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  position: absolute;
  right: 0;
}
</style>
