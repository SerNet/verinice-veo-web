<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Array Field</PageHeader>
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="isVertical"
          label="Vertical"
          hide-details
          color="primary"
        />
      </v-col>
      <v-col
        cols="auto"
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
          properties: {
            arrayField: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  inputText: {
                    type: 'string'
                  },
                  checkbox: {
                    type: 'boolean'
                  }
                }
              }
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/arrayField',
          options: {
            label: 'Array Field'
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/inputText',
              options: {
                label: 'Input Text'
              }
            },
            {
              type: 'Control',
              scope: '#/properties/checkbox',
              options: {
                label: 'Checkbox'
              }
            }
          ]
        },
        data: {
          arrayField: [
            { inputText: 'Beispiel-1', checkbox: false },
            { inputText: 'Beispiel-2', checkbox: true }
          ]
        }
      },
      formVertical: {
        objectSchema: {
          type: 'object',
          properties: {
            arrayField: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  inputText: {
                    type: 'string'
                  },
                  checkbox: {
                    type: 'boolean'
                  }
                }
              }
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/arrayField',
          options: {
            direction: 'vertical',
            label: 'Array Field'
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/inputText',
              options: {
                label: 'Input Text'
              }
            },
            {
              type: 'Control',
              scope: '#/properties/checkbox',
              options: {
                label: 'Checkbox'
              }
            }
          ]
        },
        data: {
          arrayField: [
            { inputText: 'Beispiel-1', checkbox: false },
            { inputText: 'Beispiel-2', checkbox: true }
          ]
        }
      },
      isVertical: false
    };
  },
  computed: {
    dynamicForm(): any {
      if (this.isVertical) {
        return this.formVertical;
      }
      return this.form;
    }
  }
});
</script>

<style lang="scss"></style>
