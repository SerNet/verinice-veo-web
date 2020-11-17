<template>
  <v-col
    class="pa-0 fill-height overflow-hidden"
    style="max-height: calc(100vh - 70px);"
    cols="12"
  >
    <v-row class="fill-height ma-0">
      <v-col
        class="pa-0"
        :style="{ maxHeight }"
        style="overflow: auto"
        cols="12"
        lg="6"
      >
        <h1 class="ml-4 mt-2">Form Schema Editor</h1>
        <FormSchemaEditor :object-schema="objectSchema" v-model="formSchema" />
      </v-col>
      <v-col
        class="pa-0 fill-height"
        :style="{ maxHeight }"
        style="overflow: auto;"
        cols="12"
        lg="6"
      >
        <v-tabs v-model="tab">
          <v-tabs-slider></v-tabs-slider>

          <v-tab href="#tab-1">
            Code
          </v-tab>

          <v-tab href="#tab-2">
            Preview
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
          <v-tab-item value="tab-1">
            <v-card class="pa-3 ma-1" outlined>
              <CodeEditor v-model="code" />
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab-2">
            <v-card class="pa-3 ma-1" outlined>
              <VeoForm
                :schema="objectSchema"
                :ui="formSchema.content"
                :lang="lang"
                :api="{}"
                v-model="objectData"
              />
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoForm from '~/components/forms/VeoForm.vue'

export default Vue.extend({
  components: {
    VeoForm
  },
  async fetch() {
    const objectSchema = await this.$api.schema.fetch('process')
    this.objectSchema = objectSchema
  },
  data() {
    return {
      tab: 'form-schema',
      objectSchema: {},
      formSchema: {
        name: 'Verarbeitungstätigkeiten',
        modelType: 'Process',
        content: {
          type: 'Layout',
          options: {
            format: 'group',
            direction: 'vertical'
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/name',
              options: {
                label: 'Name'
              }
            },
            {
              type: 'Control',
              scope:
                '#/properties/customAspects/properties/process_SensitiveData/properties/attributes/properties/process_SensitiveData_comment',
              options: {
                format: 'multiline',
                label: 'process_SensitiveData_comment'
              }
            }
          ]
        }
      },
      lang: {},
      objectData: {}
    }
  },
  computed: {
    maxHeight(): string {
      return 'calc(100vh - ' + this.$vuetify.application.top + 'px)'
    },
    code: {
      get(): string {
        return this.formSchema
          ? JSON.stringify(this.formSchema, undefined, 2)
          : ''
      },
      set(v: string) {
        try {
          this.formSchema = JSON.parse(v)
        } catch (e) {}
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
