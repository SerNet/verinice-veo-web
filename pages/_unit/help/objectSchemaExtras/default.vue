<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Default</PageHeader>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        lg="4"
        class="docs-form-sector"
      >
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
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      form: {
        objectSchema: {
          type: 'object',
          required: ['inputText'],
          properties: {
            inputText: {
              type: 'string',
              default: 'Default Wert'
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/inputText',
          options: {
            label: 'Input Text'
          }
        },
        data: {}
      }
    };
  },
  computed: {
    dynamicForm(): any {
      return this.form;
    }
  }
});
</script>

<style lang="scss"></style>
