<template>
  <VeoPage>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Style</PageHeader>
      </v-col>
      <v-col cols="12">
        <v-select
          v-model="definition.value"
          label="Definiert als"
          :items="definition.items"
          style="max-width:400px"
        />
      </v-col>
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector d-flex justify-center">
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
        objectSchema: {},
        formSchema: {
          type: 'Label',
          text: 'Beispiel Text',
          options: {
            style: 'font-size: 3rem; font-weight: 700; font-style: italic;'
          }
        },
        data: {}
      },
      formObject: {
        objectSchema: {},
        formSchema: {
          type: 'Label',
          text: 'Beispiel Text',
          options: {
            style: {
              'font-size': '3rem',
              'font-weight': 700,
              'font-style': 'italic'
            }
          }
        },
        data: {}
      },
      formArray: {
        objectSchema: {},
        formSchema: {
          type: 'Label',
          text: 'Beispiel Text',
          options: {
            style: [
              { 'font-size': '3rem' },
              { 'font-weight': 700 },
              { 'font-style': 'italic' }
            ]
          }
        },
        data: {}
      },
      definition: { value: 'String', items: ['String', 'Object', 'Array'] }
    }
  },
  computed: {
    dynamicForm(): any {
      if (this.definition.value === 'Object') {
        return this.formObject
      }
      if (this.definition.value === 'Array') {
        return this.formArray
      }
      return this.form
    }
  }
})
</script>

<style lang="scss"></style>
