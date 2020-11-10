<template>
  <v-container class="ml-0">
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Input Text</PageHeader>
      </v-col>
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector">
        <VeoForm
          v-model="form.data"
          :schema="form.objectSchema"
          :ui="form.formSchema"
        />
      </v-col>
    </v-row>
    <FormDescription
      :object-schema="form.objectSchema"
      :form-schema="form.formSchema"
      :data="form.data"
    />
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
        data: {
          inputText: 'Beispiel'
        }
      }
    }
  }
})
</script>

<style lang="scss"></style>
