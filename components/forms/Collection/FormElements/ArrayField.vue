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
    class="vf-array-field vf-form-element mb-2"
    :class="options && options.class"
    :style="options && options.style"
  >
    <div class="d-flex">
      <span
        v-if="options && options.label"
        class="subtitle-1 mb-2"
      >
        {{ options && options.label }}
      </span>
      <v-spacer />
    </div>
    <v-list
      dense
      class="py-0 ml-2"
    >
      <v-list-item
        v-for="(val, i) in value"
        :key="i"
        class="vf-array-field-item my-2 pt-2"
        :style="[isDefaultRow[i] ? { opacity: 0.5 } : { opacity: 1 }]"
      >
        <v-list-item-content>
          <VeoForm
            :schema="schema.items"
            :ui="ui"
            :value="value[i]"
            :general-translation="generalTranslation"
            :custom-translation="customTranslation"
            :disabled="disabled"
            :domain-id="domainId"
            @input="onInput"
          />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn
            depressed
            text
            fab
            small
            :disabled="!value || disabled"
            class="vf-btn-remove"
            @click="removeRow(i)"
          >
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-btn
      small
      text
      color="primary"
      :disabled="disabled"
      class="vf-btn-add"
      @click="addRow()"
    >
      <v-icon small>
        mdi-plus
      </v-icon>
      <span>{{ $t('addElement') }}</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { PropOptions } from 'vue/types/options';
import { JSONSchema7 } from 'json-schema';
import { BaseObject } from '~/components/forms/utils';
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers';
import { IVeoTranslationCollection } from '~/types/VeoTypes';

export default Vue.extend({
  name: 'ArrayField',
  props: {
    value: {
      type: Array,
      default: undefined
    } as PropOptions<BaseObject[]>,
    name: {
      type: String,
      default: undefined
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
    elements: {
      type: Array,
      default: undefined
    },
    domainId: {
      type: String,
      default: undefined
    },
    disabled: Boolean,
    visible: Boolean
  },
  computed: {
    ui() {
      return {
        type: 'Layout',
        options: {
          direction: this.options && this.options.direction === 'vertical' ? 'vertical' : 'horizontal',
          format: 'group'
        },
        elements: this.elements
      };
    },
    rowToAdd(): {} {
      return (
        typeof this.schema.items !== 'undefined' &&
        !Array.isArray(this.schema.items) &&
        typeof this.schema.items !== 'boolean' &&
        typeof this.schema.items.default !== 'undefined' &&
        this.schema.items.default !== null &&
        !Array.isArray(this.schema.items.default) &&
        this.schema.items.default instanceof Object && {
          ...this.schema.items.default
        }
      );
    },
    isDefaultRow(): boolean[] {
      return this.value.map((val) => JSON.stringify(val) === JSON.stringify(this.rowToAdd));
    }
  },
  methods: {
    addRow() {
      const value = this.value ? this.value : [];
      value.push({ ...this.rowToAdd });
      this.$emit('input', value);
    },
    removeRow(rowIndex: number) {
      const value = this.value;
      value.splice(rowIndex, 1);
      this.$emit('input', value);
    },
    onInput() {
      this.$emit('input', this.value);
    },
    isRowExist() {
      return this.value;
    }
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([props.schema.type === 'array', typeof props.elements !== 'undefined']);
  }
};
</script>

<i18n>
{
  "en": {
    "addElement": "Add element"
  },
  "de": {
    "addElement": "Element hinzufügen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.vf-array-field > div {
  transition: opacity 0.7s;
}

.vf-array-field-item {
  border: 1px solid $medium-grey;
  border-radius: 4px;
}

::v-deep .vf-control.col {
  padding: 0 5px 0 0;
}
</style>
