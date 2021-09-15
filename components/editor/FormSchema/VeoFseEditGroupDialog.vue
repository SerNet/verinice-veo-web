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
  <VeoDialog
    :key="formSchemaPointer"
    :value="value"
    :headline="$t('editGroupHeadline')"
    large
    @input="onDialogChanged"
  >
    <template #default>
      <v-form>
        <v-row
          no-gutters
          class="align-center mt-4"
        >
          <v-col
            :cols="12"
            :md="5"
          >
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.label.text') }}:</span>
          </v-col>
          <v-col
            :cols="12"
            :md="5"
          >
            <v-text-field
              :value="localCustomTranslation[localName]"
              :label="$t('editor.formschema.edit.input.label')"
              required
              @input="onInputLabel"
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="align-center"
        >
          <v-col
            :cols="12"
            :md="5"
          >
            <span style="font-size: 1.2rem;">{{ $t('editor.formschema.edit.input.direction') }}*:</span>
          </v-col>
          <v-col
            :cols="12"
            :md="5"
          >
            <v-autocomplete
              v-model="formData.direction"
              :items="directionItems"
              :label="$t('editor.formschema.edit.input.direction')"
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="align-center"
        >
          <v-col
            :cols="12"
            :md="5"
          >
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.css.class') }}: </span>
          </v-col>
          <v-col
            :cols="12"
            :md="5"
          >
            <v-combobox
              v-model="formData.class"
              :label="$t('editor.formschema.edit.css.class.text')"
              multiple
              chips
              append-icon=""
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="align-center"
        >
          <v-col
            :cols="12"
            :md="5"
          >
            <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.edit.css.style') }}: </span>
          </v-col>
          <v-col
            :cols="12"
            :md="5"
          >
            <v-combobox
              v-model="formData.style"
              :label="$t('editor.formschema.edit.css.style.text')"
              multiple
              chips
              append-icon=""
            />
          </v-col>
        </v-row>
        <VeoFseConditions v-model="formData.rule" />
      </v-form>
      <small>{{ $t('global.input.requiredfields') }}</small>
    </template>
    <template #dialog-options>
      <v-btn
        text
        color="primary"
        @click="onDialogChanged(false)"
      >
        {{ $t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="updateElement"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, PropType, Ref, ref, reactive, getCurrentInstance } from '@nuxtjs/composition-api';
import { v4 as uuid } from 'uuid';
import { JsonPointer } from 'json-ptr';
import { merge } from 'lodash';
import { BaseObject } from '~/components/forms/utils';
import { IVeoFormSchemaCustomTranslationEvent, IVeoFormSchemaItemUpdateEvent, IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';

interface IProps {
  value: boolean;
  name: string;
  options: any;
  formSchema: any;
  formSchemaPointer: string;
  customTranslations: IVeoFormSchemaTranslationCollection;
  language: string;
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      default: undefined
    },
    options: {
      type: Object as PropType<any>,
      default: undefined
    },
    formSchema: {
      type: Object,
      required: true
    },
    formSchemaPointer: {
      type: String,
      default: undefined
    },
    customTranslations: {
      type: Object,
      default: () => {}
    },
    language: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    // Default values which should not be shown in FormSchema
    const defaults: BaseObject = {
      direction: 'vertical',
      class: undefined,
      style: undefined
    };

    const localCustomTranslation: Ref<IVeoFormSchemaTranslationCollection> = ref({ ...props.customTranslations });

    // Get values of element by Pointer and if is not defined, get its default values (e.g. direction = undefined => 'vertical')
    function getValue(pointer: string, defaultValue: any): any {
      const elValue = JsonPointer.get(props.formSchema, pointer);
      // Default values are not set mostly in FormSchema, therefore in this case return defaultValue, otherwise the real value
      return typeof elValue === 'undefined' || elValue === defaultValue ? defaultValue : elValue;
    }

    // Transform string values of class/style ("class-1 class-2 class-3") to an array (["class-1", "class-2", "class-3"])
    function getAsArray(type: 'class' | 'style'): string[] | undefined {
      if (props.formSchema?.options?.[type]) {
        const split = props.formSchema?.options?.[type].split(type === 'style' ? ';' : ' ');
        return split.filter((el: string) => !!el);
      } else {
        return [];
      }
    }

    // Get current instance for using translations in Setup() https://github.com/kazupon/vue-i18n/issues/693#issuecomment-583796174
    const vm = getCurrentInstance();

    const directionItems = ref([
      {
        text: vm?.$i18n.t('editor.formschema.edit.input.direction.vertical'),
        value: 'vertical'
      },
      {
        text: vm?.$i18n.t('editor.formschema.edit.input.direction.horizontal'),
        value: 'horizontal'
      }
    ]);

    const localName = ref(props.name);

    const formData = reactive({
      label: (localName.value && props.customTranslations?.[props.language][localName.value]) as string | undefined,
      direction: getValue('#/options/direction', defaults.direction),
      class: getAsArray('class') as string[],
      style: getAsArray('style') as string[],
      rule: getValue('#/rule', undefined)
    });

    // Transform array values of class/style backwards to string
    function getAsString(type: 'class' | 'style'): string | undefined {
      if (formData[type] && formData[type].length > 0) {
        const string = formData[type]?.join(type === 'style' ? ';' : ' ');
        return string;
      } else {
        return undefined;
      }
    }

    function onInputLabel(event: string): void {
      if (!localName.value) {
        localName.value = `group_${uuid()}`;
      }
      localCustomTranslation.value[props.language][localName.value] = event;
    }

    // Transform local values of options' properties to FormSchema suitable form
    function transformValues(values: any): any {
      let transformedValues = JSON.parse(JSON.stringify(values));
      ['class', 'style'].forEach((propName: any) => {
        transformedValues[propName] = getAsString(propName);
      });

      // Remove rule property, because it does not belongs to options
      delete transformedValues.rule;

      // Set label property in transformed values to the pointer of form translations.
      if (localName.value) {
        transformedValues.label = `#lang/${localName.value}`;
      }
      Object.entries(transformedValues)
        .filter(([key, val]) => Object.prototype.hasOwnProperty.call(defaults, key) && val === defaults[key])
        .forEach(([key, _]) => {
          // Properties with "null" values will be removed from the object
          transformedValues[key] = null;
        });

      transformedValues = merge(props.options, transformedValues);
      Object.entries(transformedValues)
        .filter(([_, val]) => val === null)
        .forEach(([key, _]) => {
          delete transformedValues[key];
        });
      return transformedValues;
    }

    // Emit Open/Close (true/false) events when dialog state changes
    function onDialogChanged(event: boolean) {
      context.emit('input', event);
    }

    // Emit translations and FormSchema updates of the element
    function updateElement() {
      const options: any = transformValues(formData);
      const formSchema = JSON.parse(JSON.stringify(props.formSchema));
      let updateData: any = { ...formSchema };
      if (Object.keys(options).length === 0) {
        if (Object.prototype.hasOwnProperty.call(updateData, 'options')) {
          delete updateData.options;
        }
      } else {
        updateData = { ...updateData, options };
      }
      // Add rule at the end of the element data if the rule exists, otherwise remove it from the element data
      if (formData.rule) {
        updateData = { ...updateData, rule: formData.rule };
      } else {
        delete updateData.rule;
      }
      const updateTranslation: IVeoFormSchemaCustomTranslationEvent = JSON.parse(JSON.stringify(localCustomTranslation.value));
      context.emit('edit', updateData as IVeoFormSchemaItemUpdateEvent['data']);
      context.emit('update-custom-translation', updateTranslation);
    }

    return {
      formData,
      localName,
      localCustomTranslation,
      onDialogChanged,
      updateElement,
      directionItems,
      onInputLabel
    };
  }
});
</script>

<i18n>
{
  "en": {
    "editGroupHeadline": "Edit group element"
  },
  "de": {
    "editGroupHeadline": "Gruppen Element anpassen"

  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
