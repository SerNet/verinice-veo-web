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
              :value="groupTitle"
              label="Group title"
              hide-details
              clearable
              @input="onInputGroupTitle"
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
        <VeoForm
          v-model="form.data"
          :schema="form.objectSchema"
          :ui="form.formSchema"
        />
      </v-col>
    </v-row>
    <FormDescription
      :object-schema="form.objectSchema"
      :form-schema="form.formSchema"
      :data="form.data"
    />
  </BasePage>
</template>

<script lang="ts">
import vjp from 'vue-json-pointer';

export default {
  layout: 'plain',
  data() {
    return {
      form: {
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
      },
      direction: 'vertical',
      border: false,
      groupTitle: undefined
    };
  },
  watch: {
    direction: {
      immediate: true,
      handler() {
        this.update('/options/direction', this.direction);
      }
    },
    border: {
      immediate: true,
      handler() {
        if (this.border) {
          this.update('/options/class', 'border');
        } else {
          this.update('/options/class', undefined);
        }
      }
    }
  },
  methods: {
    update(jsonPointer: string, value: any): void {
      vjp.set(this.form.formSchema, jsonPointer, value);
      this.form.formSchema = { ...this.form.formSchema };
    },
    onInputGroupTitle(event: any) {
      this.groupTitle = event;
      if (event) {
        this.update('/options/label', event);
      } else {
        this.update('/options/label', undefined);
      }
    }
  }
};
</script>

<style lang="scss"></style>
