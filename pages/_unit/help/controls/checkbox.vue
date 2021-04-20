<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Checkbox</PageHeader>
      </v-col>
      <v-col cols="auto" class="docs-form-sector">
        <VeoForm v-model="form.data" :schema="form.objectSchema" :ui="form.formSchema" />
      </v-col>
    </v-row>
    <FormDescription :object-schema="form.objectSchema" :form-schema="form.formSchema" :data="form.data" />
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      form: {
        objectSchema: {
          type: 'object',
          properties: {
            checkbox: {
              type: 'boolean'
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/checkbox',
          options: {
            label: 'Checkbox'
          }
        },
        data: {
          checkbox: true
        }
      }
    }
  }
})
</script>

<style lang="scss"></style>
