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
    title="Group"
    fixed-header
  >
    <v-row justify="center">
      <v-col cols="12">
        <v-row>
          <v-col cols="2">
            <v-switch
              v-model="direction"
              :label="`Direction: ${direction}`"
              hide-details
              color="primary"
              false-value="vertical"
              true-value="horizontal"
            />
          </v-col>
          <v-col cols="auto">
            <v-switch
              v-model="border"
              label="Border"
              hide-details
              color="primary"
            />
          </v-col>
          <v-col
            cols="2"
            class="ml-10"
          >
            <v-text-field
              v-model="groupTitle"
              label="Group title"
              hide-details
              clearable
              variant="underlined"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        lg="4"
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
      inputText: {
        type: 'string'
      },
      select: {
        type: 'string',
        enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
      }
    }
  },
  formSchema: {
    type: 'Layout',
    options: {
      format: 'group'
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
        scope: '#/properties/select',
        options: {
          label: 'Select'
        }
      }
    ]
  },
  data: {
    inputText: 'Beispiel',
    select: 'Beispiel-1'
  }
});

const direction = ref('vertical');
const border = ref(false);
const groupTitle = ref(undefined);

watch(() => direction.value, (newValue) => {
  form.value.formSchema.options.direction = newValue;
});
  
watch(() => border.value, (newValue) => {
  form.value.formSchema.options.class = newValue ? 'border' : '';
});

watch(() => groupTitle.value, (newValue) => {
  form.value.formSchema.options.label = newValue;
});
</script>
