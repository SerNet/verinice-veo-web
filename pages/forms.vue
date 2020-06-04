<template>
  <div>
    <VeoForm v-model="form.value" :schema="form.schema" :ui="form.ui" />
    <!-- <VeoForm v-model="test" :visible="true" name="asadadad" :options="options" :schema="schema" :disabled="false" /> -->
    <!-- <HelloWorld /> -->
    <!-- <SfcRollupVuetifySample v-model="test" /> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { VeoForm } from '@cpmsys/veo-forms'
// import '@cpmsys/veo-forms/lib/css/main.css'
// import { SfcRollupVuetifySample } from 'sfc-rollup-vuetify'

export default Vue.extend({
  name: 'Forms',
  components: {
    VeoForm
    // SfcRollupVuetifySample
  },
  data() {
    return {
      test: '',
      schema: {
        type: 'string'
      },
      options: {
        label: 'Text'
      },
      form: {
        schema: {
          type: 'object',
          required: ['name', 'description', 'orderMulti'],
          properties: {
            name: {
              type: 'string',
              minLength: 1
            },
            description: {
              type: 'string'
            }
          }
        },
        ui: {
          type: 'Layout',
          options: {
            direction: 'vertical',
            format: 'group'
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/name',
              options: {
                label: 'Input Text'
              }
            },
            {
              type: 'Control',
              scope: '#/properties/description',
              options: {
                label: 'Description',
                format: 'multiline',
                maxRows: 12
              }
            }
          ]
        },
        value: {}
      }
    }
  },
  methods: {},
  head() {
    return {
      title: 'History'
    }
  }
})
</script>

<style scoped></style>
