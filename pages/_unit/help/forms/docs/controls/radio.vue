<template>
  <v-container class="ml-0">
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Radio</PageHeader>
      </v-col>
      <v-col cols="12">
        <v-switch v-model="isHorizontal" label="Vertikal" hide-details color="primary" />
      </v-col>
      <v-col cols="auto" class="docs-form-sector">
        <VeoForm v-model="dynamicForm.data" :schema="dynamicForm.objectSchema" :ui="dynamicForm.formSchema" />
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
import FormDescription from '~/components/help/FormDescription.vue'
import PageHeader from '~/components/help/PageHeader.vue'
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
            radio: {
              enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/radio',
          options: {
            label: 'Radio',
            format: 'radio'
          }
        },
        data: {
          radio: 'Beispiel-1'
        }
      },
      formVertical: {
        objectSchema: {
          type: 'object',
          properties: {
            radio: {
              enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/radio',
          options: {
            label: 'Radio',
            format: 'radio',
            direction: 'vertical'
          }
        },
        data: {
          radio: 'Beispiel-1'
        }
      },
      isHorizontal: false
    }
  },
  computed: {
    dynamicForm(): any {
      if (this.isHorizontal) {
        return this.formVertical
      }
      return this.form
    }
  }
})
</script>

<style lang="scss"></style>
