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
  <BasePage title="Radio" fixed-header>
    <v-row justify="center">
      <v-col cols="12">
        <v-switch v-model="isVertical" label="Vertikal" hide-details color="primary" />
      </v-col>
      <v-col cols="auto" class="docs-form-sector">
        <!-- @vue-ignore TODO #3066 not assignable -->
        <DynamicFormEntrypoint
          v-model="dynamicForm.data"
          :object-schema="dynamicForm.objectSchema"
          :form-schema="dynamicForm.formSchema"
        />
      </v-col>
    </v-row>
    <HelpFormDescription
      :object-schema="dynamicForm.objectSchema"
      :form-schema="dynamicForm.formSchema"
      :data="dynamicForm.data"
    />
  </BasePage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'plain' });

const form = ref({
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
});

const formVertical = ref({
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
});

const isVertical = ref(false);

const dynamicForm = computed(() => {
  if (isVertical.value) {
    return formVertical.value;
  }
  return form.value;
});
</script>
