<template>
  <div>
    <VeoForm v-model="form.value" :schema="form.schema" :ui="form.ui" />
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
              scope: '#/properties/name'
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
