<!--
   - verinice.veo web
   - Copyright (C) 2021 Davit Svandize, Jonas Heitmann
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
    class="vf-tags vf-form-element"
  >
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <v-combobox
        :disabled="disabled"
        :value="value"
        :error-messages="errors[0]"
        :label="options && options.label"
        :items="items"
        :class="options && options.class"
        :style="options && options.style"
        chips
        deletable-chips
        multiple
        dense
        hide-details="auto"
        clearable
        :return-object="false"
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
        @click:clear="clear"
      />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';
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
  name: 'Tags',
  props: {
    value: {
      type: Array,
      default: () => undefined
    } as PropOptions<string[]>,
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: () => undefined
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
      default: () => undefined
    },
    validation: {
      type: Object,
      default: () => undefined
    },
    disabled: Boolean,
    visible: Boolean
  },
  computed: {
    isItemsWithCustomizedLabels(): boolean {
      return !!(this.options && Array.isArray(this.options.enum));
    },
    enum(): string[] {
      if (this.schema.items && !Array.isArray(this.schema.items) && this.schema.items instanceof Object && typeof this.schema.items.anyOf !== 'undefined') {
        const objWithEnum = this.schema.items.anyOf.find((o) => o instanceof Object && o.enum);
        if (objWithEnum instanceof Object && Array.isArray(objWithEnum.enum)) {
          return [...objWithEnum.enum] as string[];
        }
      }
      return [];
    },
    items(): IItem[] {
      if (this.enum?.length > 0) {
        return this.generateItems(this.enum);
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
    generateItems(schemaEnum: string[]): IItem[] {
      return this.isItemsWithCustomizedLabels ? this.getCustomizedLabelItems(schemaEnum) : this.getTranslatedLabelItems(schemaEnum);
    }
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      props.schema.type === 'array',
      !!props.schema.items,
      props.schema.items instanceof Object && !Array.isArray(props.schema.items) && typeof props.schema.items.anyOf !== 'undefined'
    ]);
  }
};
</script>

<style lang="scss" scoped>
.vf-tags {
  width: 250px;
}
</style>
