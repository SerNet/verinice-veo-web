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
    density="compact"
  >
    <v-divider
      v-if="type === IVeoFilterOptionType.DIVIDER"
    />
    <v-text-field
      v-else-if="type === IVeoFilterOptionType.TEXT"
      :model-value="modelValue"
      :label="upperFirst($t(`objectlist.${name}`).toString()) + (required ? '*' : '')"
      :required="required"
      :rules="required ? [requiredRule] : []"
      :disabled="disabled"
      :name="name"
      :clearable="!required"
      variant="underlined"
      hide-details="auto"
      @update:model-value="onInput($event)"
    />
    <v-select
      v-else-if="type === IVeoFilterOptionType.SELECT"
      :model-value="modelValue"
      :label="upperFirst($t(`objectlist.${name}`).toString()) + (required ? '*' : '')"
      :required="required"
      :rules="required ? [requiredRule] : []"
      :items="selectOptions"
      :disabled="disabled"
      :name="name"
      :clearable="!required"
      hide-details="auto"
      variant="underlined"
      @update:model-value="onInput($event)"
    />
    <v-checkbox
      v-else-if="type === IVeoFilterOptionType.CHECKBOX"
      :model-value="modelValue"
      :label="upperFirst($t(`objectlist.${name}`).toString()) + (required ? '*' : '')"
      :required="required"
      :rules="required ? [requiredRule] : []"
      :disabled="disabled"
      :name="name"
      hide-details="auto"
      true-value="true"
      :false-value="undefined"
      variant="underlined"
      @update:model-value="onInput($event)"
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
  selectOptions?: { title: string; value: string }[];
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface IVeoFilterDivider {
  type: IVeoFilterOptionType.DIVIDER;
}

export default defineComponent({
  props: {
    modelValue: {
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
      type: Array as PropType<{ title: string; value: string }[]>,
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
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { requiredRule } = useRules();

    const onInput = (newValue: any) => {
      emit('update:model-value', newValue);
      if (props.onChange) {
        props.onChange(newValue);
      }
    };

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
