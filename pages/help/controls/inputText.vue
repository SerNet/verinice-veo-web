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
  <BasePage title="Input Text" fixed-header>
    <v-row justify="center">
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector">
        <DynamicFormEntrypoint
          v-model="form.data"
          :object-schema="form.objectSchema"
          :form-schema="form.formSchema" />
      </v-col>
    </v-row>
    <HelpFormDescription
      :object-schema="form.objectSchema"
      :form-schema="form.formSchema"
      :data="form.data" />
  </BasePage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'plain' });

const form = ref({
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
});
</script>
