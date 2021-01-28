<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Tags</PageHeader>
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
import PageHeader from '~/components/help/PageHeader.vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import FormDescription from '~/components/help/FormDescription.vue'

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
            tags: {
              type: 'array',
              items: {
                anyOf: [
                  {
                    type: 'string',
                    enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
                  },
                  {
                    type: 'string'
                  }
                ]
              }
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/tags',
          options: {
            label: 'Tags',
            format: 'tags'
          }
        },
        data: {
          tags: ['Beispiel-1', 'Beispiel-2']
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
