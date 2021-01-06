<template>
  <VeoPage>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Enable</PageHeader>
      </v-col>
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector">
        <VeoForm
          v-model="dynamicForm.data"
          :schema="dynamicForm.objectSchema"
          :ui="dynamicForm.formSchema"
        />
      </v-col>
    </v-row>
    <FormDescription
      :object-schema="dynamicForm.objectSchema"
      :form-schema="dynamicForm.formSchema"
      :data="dynamicForm.data"
    />
    </VeoPage>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import FormDescription from '~/components/help/FormDescription.vue'
import PageHeader from '~/components/help/PageHeader.vue'

export default Vue.extend({
  components: {
    VeoForm,
    FormDescription,
    PageHeader
  },
  data() {
    return {
      form: {
        objectSchema: {
          type: 'object',
          properties: {
            inputText: {
              type: 'string'
            },
            select: {
              type: 'string',
              enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
            }
          }
        },
        formSchema: {
          type: 'Layout',
          options: {
            format: 'group',
            direction: 'vertical',
            highlight: false
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/inputText',
              options: {
                label: 'Input Text'
              },
              rule: {
                effect: 'ENABLE',
                condition: {
                  scope: '#/properties/select',
                  schema: { const: 'Beispiel-3' }
                }
              }
            },
            {
              type: 'Control',
              scope: '#/properties/select',
              options: {
                label: 'Select'
              }
            }
          ]
        },
        data: {
          inputText: 'Beispiel',
          select: 'Beispiel-1'
        }
      }
    }
  },
  computed: {
    dynamicForm(): any {
      return this.form
    }
  }
})
</script>

<style lang="scss"></style>
