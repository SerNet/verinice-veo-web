<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Select</PageHeader>
      </v-col>
      <v-col cols="12">
        <v-switch v-model="isMultiselect" label="Multiselect" hide-details color="primary" />
      </v-col>
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector">
        <VeoForm v-model="dynamicForm.data" :schema="dynamicForm.objectSchema" :ui="dynamicForm.formSchema" />
      </v-col>
    </v-row>
    <FormDescription
      :object-schema="dynamicForm.objectSchema"
      :form-schema="dynamicForm.formSchema"
      :data="dynamicForm.data"
    />
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
            select: {
              enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/select',
          options: {
            label: 'Select'
          }
        },
        data: {
          select: 'Beispiel-1'
        }
      },
      formMultiselect: {
        objectSchema: {
          type: 'object',
          properties: {
            select: {
              type: 'array',
              items: {
                enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
              }
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/select',
          options: {
            label: 'Select'
          }
        },
        data: {
          select: ['Beispiel-1']
        }
      },
      isMultiselect: false
    }
  },
  computed: {
    dynamicForm(): any {
      if (this.isMultiselect) {
        return this.formMultiselect
      }
      return this.form
    }
  }
})
</script>

<style lang="scss"></style>
