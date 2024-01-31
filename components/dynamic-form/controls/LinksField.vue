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
  <div
    v-if="options.visible"
    :class="options && options.class"
    class="vf-links-field vf-form-element"
    :data-attribute-name="last(objectSchemaPointer.split('/'))">
    <v-list>
      <v-list-item
        v-for="(link, index) of internalValue"
        :key="index"
        class="veo-links-field-border mt-4 px-4">
        <DynamicFormControlsLinksFieldRow
          v-bind="$props"
          :model-value="link.target"
          :other-selected-links="getOtherSelectedLinks(index)"
          :object-schema-pointer="objectSchemaPointer + '/' + index"
          :index="index"
          @update:model-value="onLinksFieldRowInput(index, $event)">
          <slot name="default" />
        </DynamicFormControlsLinksFieldRow>
        <template #append>
          <v-list-item-action>
            <v-btn
              :icon="mdiTrashCanOutline"
              :disabled="disabled || options.disabled"
              variant="text"
              @click="removeLink(index)" />
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
    <v-btn
      v-if="!options.singleLink"
      :disabled="disabled || options.disabled"
      color="primary"
      variant="text"
      @click="addLink">
      <v-icon size="small" start :icon="mdiPlus" />
      {{ t('addLink') }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { cloneDeep, last } from 'lodash';

import { IVeoFormsElementDefinition } from '../types';
import { VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-links-field',
  name: {
    en: 'links field',
    de: 'Link-Feld'
  },
  description: {
    en: 'Lets the user select 0-n objects to link. Object type and sub type can be restricted in the object schema.',
    de: 'Lässt den User 0-n links auf andere Objekte erstellen. Objekttyp und Subtyp können durch das Objektschema bestimmt werden.'
  },
  conditions: (props) => [
    props.objectSchema.type === 'array',
    typeof props.objectSchema.items?.properties?.target !== 'undefined'
  ]
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const emptyLink = { target: undefined };

    const internalValue = computed<any[]>({
      get: () => {
        // We have to cast value to an any array, as value has the general definition of string | number | boolean | undefined | any[] | object here
        const _value: any[] = props.modelValue as any[];
        return _value && _value.length ? _value : [cloneDeep(emptyLink)];
      },
      set: (newValue: undefined | any[]) => {
        emit(
          'update:model-value',
          (
            !newValue ||
              (newValue.length === 1 &&
                JSON.stringify(emptyLink) === JSON.stringify(newValue[0]))
          ) ?
            undefined
          : newValue
        );
      }
    });

    const addLink = () => {
      internalValue.value = [...internalValue.value, cloneDeep(emptyLink)];
    };

    const removeLink = (index: number) => {
      // We clone to avoid mutating the internalValue computed prop in place (this would not call the set method of the computed property and not propagate the value to VeoForm)
      const newInternalValue = cloneDeep(internalValue.value);
      newInternalValue.splice(index, 1);

      if (!newInternalValue.length) {
        internalValue.value = [cloneDeep(emptyLink)];
      } else {
        internalValue.value = newInternalValue;
      }
    };

    const onLinksFieldRowInput = (index: number, newValue: any) => {
      const newInternalValue = internalValue.value;
      newInternalValue[index] = { target: newValue };
      internalValue.value = newInternalValue;
    };

    const getOtherSelectedLinks = (index: number) => {
      return ((props.modelValue || []) as any[]).filter(
        (_item, _index) => _index !== index
      );
    };

    return {
      addLink,
      getOtherSelectedLinks,
      internalValue,
      onLinksFieldRowInput,
      removeLink,

      last,
      mdiPlus,
      mdiTrashCanOutline,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "addLink": "Add link"
  },
  "de": {
    "addLink": "Link hinzufügen"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-links-field-border {
  border: 1px solid $medium-grey;
  border-radius: 12px;
  overflow: hidden;
}
</style>
