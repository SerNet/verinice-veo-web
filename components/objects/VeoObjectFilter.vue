<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <v-list-item
    v-bind="$attrs"
    class="px-0"
  >
    <v-divider
      v-if="type === IVeoFilterOptionType.DIVIDER"
    />
    <v-text-field
      v-else-if="type === IVeoFilterOptionType.TEXT"
      :value="value"
      :label="upperFirst(t(`objectlist.${name}`).toString()) + (required ? '*' : '')"
      :required="required"
      :rules="required ? [requiredRule] : []"
      :disabled="disabled"
      :name="name"
      :clearable="!required"
      dense
      @input="onInput($event)"
    />
    <v-select
      v-else-if="type === IVeoFilterOptionType.SELECT"
      :value="value"
      :label="upperFirst(t(`objectlist.${name}`).toString()) + (required ? '*' : '')"
      :required="required"
      :rules="required ? [requiredRule] : []"
      :items="selectOptions"
      :disabled="disabled"
      :name="name"
      :clearable="!required"
      dense
      @change="onInput($event)"
    />
    <v-checkbox
      v-else-if="type === IVeoFilterOptionType.CHECKBOX"
      :input-value="value"
      :label="upperFirst(t(`objectlist.${name}`).toString()) + (required ? '*' : '')"
      :required="required"
      :rules="required ? [requiredRule] : []"
      :disabled="disabled"
      :name="name"
      dense
      @change="onInput($event)"
    />
  </v-list-item>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';

export enum IVeoFilterOptionType {
  TEXT,
  SELECT,
  CHECKBOX,
  DIVIDER
}

export interface IVeoFilterOption {
  name: string;
  type: IVeoFilterOptionType;
  required?: boolean;
  alwaysVisible?: boolean;
  selectOptions?: { text: string; value: string }[];
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface IVeoFilterDivider {
  type: IVeoFilterOptionType.DIVIDER;
}

export default defineComponent({
  props: {
    value: {
      type: [String, Number, Array, Boolean],
      default: undefined
    },
    name: {
      type: String,
      default: undefined
    },
    type: {
      type: Number as PropType<IVeoFilterOptionType>,
      required: true
    },
    required: {
      type: Boolean,
      default: undefined
    },
    alwaysVisible: {
      type: Boolean,
      default: undefined
    },
    selectOptions: {
      type: Array as PropType<{ text: string; value: string }[]>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: undefined
    },
    onChange: {
      type: Function as PropType<(_: string) => void>,
      default: undefined
    }
  },
  emits: ['input'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const onInput = (newValue: any) => {
      emit('input', newValue);
      if (props.onChange) {
        props.onChange(newValue);
      }
    };

    function requiredRule(value: string) {
      return !!value && value.length > 0;
    }

    return {
      onInput,
      requiredRule,
      IVeoFilterOptionType,

      t,
      upperFirst
    };
  }
});
</script>
