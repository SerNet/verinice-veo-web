<template>
  <v-container class="ml-0">
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Markdown Editor</PageHeader>
      </v-col>
      <v-col cols="auto" class="docs-form-sector">
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
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import PageHeader from '~/components/help/PageHeader.vue'
import FormDescription from '~/components/help/FormDescription.vue'
import VeoForm from '~/components/forms/VeoForm.vue'

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
            markdown: {
              type: 'string'
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/markdown',
          options: {
            label: 'Markdown Editor',
            format: 'markdown'
          }
        },
        data: {
          markdown: '# Header\n\n```js\nconsole.log("Beispiel Code")\n```'
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
