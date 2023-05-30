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
  <BasePage
    title="Markdown Editor"
    fixed-header
  >
    <v-row justify="center">
      <v-col
        cols="auto"
        class="docs-form-sector"
      >
        <DynamicFormEntrypoint
          v-model="form.data"
          :object-schema="form.objectSchema"
          :form-schema="form.formSchema"
        />
      </v-col>
    </v-row>
    <HelpFormDescription
      :object-schema="form.objectSchema"
      :form-schema="form.formSchema"
      :data="form.data"
    />
  </BasePage>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'plain' });

const form = ref({
  objectSchema: {
    type: 'object',
    properties: {
      markdown: {
        type: 'string'
      }
    }
  },
  formSchema: {
    type: 'Control',
    scope: '#/properties/markdown',
    options: {
      label: 'Markdown Editor',
      format: 'markdown'
    }
  },
  data: {
    markdown: '# Header\n\n```js\nconsole.log("Beispiel Code1")\n```'
  }
});
</script>
