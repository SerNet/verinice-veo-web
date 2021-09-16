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
    class="vf-input-number vf-form-element"
  >
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <v-text-field
        :disabled="disabled"
        :value="value"
        :error-messages="errors[0]"
        :label="options && options.label"
        type="number"
        :class="options && options.class"
        :style="options && options.style"
        dense
        hide-details="auto"
        clearable
        @input="onInput($event)"
        @change="onInput($event)"
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

export default Vue.extend({
  name: 'InputNumber',
  props: {
    value: {
      type: Number,
      default: undefined
    },
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: () => undefined
    } as PropOptions<JSONSchema7>,
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
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)));
    },
    onInput(event: any): void {
      const n = parseFloat(event);
      this.$emit('input', isNaN(n) ? event : n);
    }
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([props.schema.type === 'number' || props.schema.type === 'integer']);
  }
};
</script>
