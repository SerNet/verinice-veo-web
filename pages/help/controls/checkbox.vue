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
  <BasePage title="Checkbox" fixed-header>
    <v-row justify="center">
      <v-col cols="auto" class="docs-form-sector">
        <!-- @vue-ignore TODO #3066 not assignable -->
        <DynamicFormEntrypoint v-model="data" :object-schema="objectSchema" :form-schema="formSchema" />
      </v-col>
    </v-row>
    <HelpFormDescription :object-schema="objectSchema" :form-schema="formSchema" :data="data" />
  </BasePage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'plain' });

const objectSchema = {
  type: 'object',
  properties: {
    checkbox: {
      type: 'boolean'
    }
  }
};

const formSchema = {
  type: 'Control',
  scope: '#/properties/checkbox',
  options: {
    label: 'Checkbox'
  }
};

const data = ref({
  checkbox: false
});
</script>
