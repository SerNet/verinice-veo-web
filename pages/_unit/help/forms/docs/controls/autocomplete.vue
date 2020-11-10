<template>
  <v-container class="ml-0">
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Autocomplete</PageHeader>
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="isMultiselect"
          label="Multiselect"
          hide-details
          color="primary"
        />
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
            autocomplete: {
              enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/autocomplete',
          options: {
            label: 'Autocomplete',
            format: 'autocomplete'
          }
        },
        data: {
          autocomplete: 'Beispiel-1'
        }
      },
      formMultiselect: {
        objectSchema: {
          type: 'object',
          properties: {
            autocomplete: {
              type: 'array',
              items: {
                enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
              }
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/autocomplete',
          options: {
            label: 'Autocomplete',
            format: 'autocomplete'
          }
        },
        data: {
          autocomplete: ['Beispiel-1']
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
