<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Markus Werner, Jonas Heitmann
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
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
