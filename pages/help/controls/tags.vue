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
  <VeoPage
    title="Tag"
    fixed-header
  >
    <v-row justify="center">
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
  layout: 'plain',
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
