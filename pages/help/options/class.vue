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
        <PageHeader>Class</PageHeader>
      </v-col>
      <v-col cols="12">
        <v-select
          v-model="definition.value"
          label="Definiert als"
          :items="definition.items"
          style="max-width:400px"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        lg="4"
        class="docs-form-sector d-flex justify-center"
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
        objectSchema: {},
        formSchema: {
          type: 'Label',
          text: 'Beispiel Text',
          options: {
            class: 'display-2 font-weight-bold font-italic'
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
            class: {
              'display-2': true,
              'font-weight-bold': true,
              'font-italic': true
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
            class: ['display-2', 'font-weight-bold', 'font-italic']
          }
        },
        data: {}
      },
      definition: { value: 'String', items: ['String', 'Object', 'Array'] }
    };
  },
  computed: {
    dynamicForm(): any {
      if (this.definition.value === 'Object') {
        return this.formObject;
      }
      if (this.definition.value === 'Array') {
        return this.formArray;
      }
      return this.form;
    }
  }
});
</script>

<style lang="scss"></style>
