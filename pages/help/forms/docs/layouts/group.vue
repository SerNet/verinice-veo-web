<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <page-header>Group</page-header>
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="isHorizontal"
          label="Horizontal"
          hide-details
          color="primary"
        ></v-switch>
      </v-col>
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector">
        <veo-form
          :schema="dynamicForm.objectSchema"
          :ui="dynamicForm.formSchema"
          v-model="dynamicForm.data"
        />
      </v-col>
    </v-row>
    <form-description
      :objectSchema="dynamicForm.objectSchema"
      :formSchema="dynamicForm.formSchema"
      :data="dynamicForm.data"
    ></form-description>
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
    PageHeader,
  },
  data() {
    return {
      form: {
        objectSchema: {
          type: 'object',
          properties: {
            inputText: {
              type: 'string',
            },
            select: {
              type: 'string',
              enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3'],
            },
          },
        },
        formSchema: {
          type: 'Layout',
          options: {
            format: 'group',
            direction: 'vertical',
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/inputText',
              options: {
                label: 'Input Text',
              },
            },
            {
              type: 'Control',
              scope: '#/properties/select',
              options: {
                label: 'Select',
              },
            },
          ],
        },
        data: {
          inputText: 'Beispiel',
          select: 'Beispiel-1',
        },
      },
      formHorizontal: {
        objectSchema: {
          type: 'object',
          properties: {
            inputText: {
              type: 'string',
            },
            select: {
              type: 'string',
              enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3'],
            },
          },
        },
        formSchema: {
          type: 'Layout',
          options: {
            format: 'group',
            direction: 'horizontal',
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/inputText',
              options: {
                label: 'Input Text',
              },
            },
            {
              type: 'Control',
              scope: '#/properties/select',
              options: {
                label: 'Select',
              },
            },
          ],
        },
        data: {
          inputText: 'Beispiel',
          select: 'Beispiel-1',
        },
      },
      isHorizontal: false,
    }
  },
  computed: {
    dynamicForm(): any {
      if (this.isHorizontal) {
        return this.formHorizontal
      }
      return this.form
    },
  },
})
</script>

<style lang="scss"></style>
