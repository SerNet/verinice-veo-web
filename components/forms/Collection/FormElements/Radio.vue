<!--
   - verinice.veo web
   - Copyright (C) 2021  David Svandize, Jonas Heitmann
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
    class="vf-radio vf-form-element"
  >
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <div
        v-if="options && options.label"
        class="subtitle-1"
      >
        {{ options && options.label }}
      </div>
      <v-radio-group
        :disabled="disabled"
        :value="value"
        :column="isDirectionVertical"
        :row="!isDirectionVertical"
        :error-messages="errors[0]"
        :class="options && options.class"
        :style="options && options.style"
        dense
        hide-details="auto"
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
      >
        <!-- Attention: ValidationProvider must wrap each element with ":value" property, else occures infinity loop error -->
        <ValidationProvider
          v-for="(item, i) in items"
          v-slot="{}"
          :key="i"
          :name="item.value.toString()"
        >
          <v-radio
            :value="item.value"
            :label="item.text"
            color="primary"
          />
        </ValidationProvider>
        <div slot="append">
          <v-icon @click="clear">
            mdi-close
          </v-icon>
        </div>
      </v-radio-group>
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
  name: 'Radio',
  props: {
    value: {
      type: String,
      default: undefined
    },
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
    radioValues(): string[] {
      return (this.schema && this.schema.enum ? [...this.schema.enum] : []) as string[];
    },
    radioLabels(): string[] {
      return this.options && this.options.enum ? [...this.options.enum] : [...this.radioValues];
    },
    isDirectionVertical(): boolean {
      return this.options && this.options.direction === 'vertical';
    },
    isItemsWithCustomizedLabels(): boolean {
      return !!(this.options && Array.isArray(this.options.enum));
    },
    items(): IItem[] {
      if (this.schema.enum) {
        return this.generateItems(this.schema.enum as string[]);
      } else {
        return [];
      }
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
    generateItems(schemaEnum: string[]) {
      return this.isItemsWithCustomizedLabels ? this.getCustomizedLabelItems(schemaEnum) : this.getTranslatedLabelItems(schemaEnum);
    }
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      typeof props.schema.type === 'undefined' || props.schema.type === 'string',
      typeof props.schema.enum !== 'undefined',
      typeof props.options !== 'undefined' && props.options.format === 'radio'
    ]);
  }
};
</script>
