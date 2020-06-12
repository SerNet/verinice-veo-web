<template>
  <div>
    <VeoForm v-model="form.value" :schema="form.schema" :ui="form.ui" />
    <div class="mx-auto" style="width:800px">
      <v-expansion-panels v-model="panel">
        <v-expansion-panel>
          <v-expansion-panel-header>Generated Data</v-expansion-panel-header>
          <v-expansion-panel-content>
            <code>
              <pre>{{ JSON.stringify(form.value, null, 4) }}</pre>
            </code>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { VeoForm } from '@cpmsys/veo-forms'

export default Vue.extend({
  name: 'Forms',
  components: {
    VeoForm
  },
  data() {
    return {
      panel: true,
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
              type: 'string'
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
                label: 'Name'
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
      title: 'Forms'
    }
  }
})
</script>

<style lang="scss" scoped>
code {
  padding: 20px;
  width: 100%;
}
</style>
