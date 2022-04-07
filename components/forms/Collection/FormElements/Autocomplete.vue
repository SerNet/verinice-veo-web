<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
  <div
    v-if="visible"
    class="vf-autocomplete vf-form-element"
  >
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <v-autocomplete
        :disabled="disabled"
        :value="value"
        :error-messages="errors[0]"
        :label="options && options.label"
        :items="items"
        :class="options && options.class"
        :style="options && options.style"
        :multiple="multiple"
        dense
        hide-details="auto"
        clearable
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
        @click:clear="clear"
      />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { PropOptions } from 'vue/types/options';
import { JSONSchema7 } from 'json-schema';
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers';
import { IVeoTranslationCollection } from '~/types/VeoTypes';

interface IItem {
  value: string | number | boolean;
  text: string | number | boolean;
}

interface ITranslateLabelItem {
  value: string;
  text: string;
}

export default Vue.extend({
  name: 'Autocomplete',
  props: {
    value: {
      type: [String, Array, Number],
      default: undefined
    } as PropOptions<string | string[]>,
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: undefined
    } as PropOptions<JSONSchema7>,
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    options: {
      type: Object,
      default: undefined
    },
    validation: {
      type: Object,
      default: undefined
    },
    disabled: Boolean,
    visible: Boolean
  },
  computed: {
    isItemsWithCustomizedLabels(): boolean {
      return !!(this.options && Array.isArray(this.options.enum));
    },
    items(): IItem[] {
      if (this.schema.enum) {
        return this.generateItems(this.schema.enum as string[]);
      } else if (this.schema.items && !Array.isArray(this.schema.items) && this.schema.items instanceof Object && this.schema.items.enum) {
        return this.generateItems(this.schema.items.enum as string[]);
      } else {
        return [];
      }
    },
    multiple() {
      return this.schema.type === 'array' && this.schema.items instanceof Object && !Array.isArray(this.schema.items) && typeof this.schema.items.enum !== 'undefined';
    }
  },
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)));
    },
    getCustomizedLabelItems(schemaEnum: string[]) {
      if (this.options && Array.isArray(this.options.enum)) {
        return schemaEnum.map((val: any, i: number) => ({
          value: val,
          text: this.options.enum[i]
        }));
      } else {
        return [];
      }
    },
    getTranslatedLabelItems(schemaEnum: string[]): ITranslateLabelItem[] {
      // The enum key name should be directly written in lang file
      return schemaEnum.map((translationKey: string) => {
        return {
          value: translationKey,
          text: this.customTranslation?.[translationKey] || this.generalTranslation?.[translationKey] || translationKey
        };
      });
    },
    generateItems(schemaEnum: string[]): IItem[] {
      return this.isItemsWithCustomizedLabels ? this.getCustomizedLabelItems(schemaEnum) : this.getTranslatedLabelItems(schemaEnum);
    }
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      typeof props.schema.type === 'undefined' ||
        props.schema.type === 'string' ||
        props.schema.type === 'array' ||
        props.schema.type === 'integer' ||
        props.schema.type === 'number',
      typeof props.schema.enum !== 'undefined' || (props.schema.items instanceof Object && !Array.isArray(props.schema.items) && typeof props.schema.items.enum !== 'undefined'),
      typeof props.options !== 'undefined' && props.options.format === 'autocomplete'
    ]);
  }
};
</script>
