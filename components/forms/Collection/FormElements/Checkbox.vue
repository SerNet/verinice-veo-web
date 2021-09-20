<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize
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
    class="vf-checkbox vf-form-element"
  >
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <v-checkbox
        :input-value="value"
        :error-messages="errors[0]"
        :disabled="disabled"
        :label="options && options.label"
        :class="options && options.class"
        :style="options && options.style"
        :indeterminate="indeterminate"
        color="primary"
        dense
        hide-details="auto"
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
      >
        <div slot="append">
          <v-icon @click="clear">
            mdi-close
          </v-icon>
        </div>
      </v-checkbox>
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { PropOptions } from 'vue/types/options';
import { JSONSchema7 } from 'json-schema';
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers';

export default Vue.extend({
  name: 'Checkbox',
  props: {
    value: Boolean,
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: undefined
    } as PropOptions<JSONSchema7>,
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
  data() {
    return {
      indeterminate: this.value === undefined
    };
  },
  watch: {
    value(val) {
      this.$nextTick(() => {
        return (this.indeterminate = val === undefined);
      });
    }
  },
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)));
    }
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([props.schema.type === 'boolean']);
  }
};
</script>
