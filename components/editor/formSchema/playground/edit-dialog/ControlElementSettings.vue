<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <div>
    <section data-component-name="control-element-settings">
      <h2 class="text-h2">
        {{ t('common') }}
      </h2>
      <BaseCard>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" class="d-flex align-center">
              <EditorFormSchemaPlaygroundEditDialogTranslatedInput
                :form-schema-element="formSchemaElement"
                @update:form-schema-element="emit('update:form-schema-element', $event)"
                @set-translation="
                  (translationKey: string, newValue: string | undefined) =>
                    emit('set-translation', translationKey, newValue)
                "
              />
            </v-col>
          </v-row>
        </v-card-text>
      </BaseCard>
    </section>
    <section class="mt-4" data-component-name="control-element-element-specific-settings">
      <h2 class="text-h2">
        {{ t('formElement') }}
      </h2>
      <UtilProminentSelectionList
        v-model="elementTypeModelValue"
        :items="elementInputAlternatives"
        density="compact"
        bg-color="transparent"
      />
    </section>
    <section v-if="elementsWithOptions.includes(elementTypeModelValue || '')" class="mt-4">
      <h2 class="text-h2">
        {{ t('formElementOptions') }}
        <BaseCard>
          <v-card-text>
            <v-row v-if="elementTypeModelValue === 'Radio'">
              <v-col cols="12" md="6">
                <EditorFormSchemaPlaygroundEditDialogElementDirectionOptions
                  :form-schema-element="formSchemaElement"
                  @update:form-schema-element="emit('update:form-schema-element', $event)"
                />
              </v-col>
            </v-row>
            <v-row v-if="elementTypeModelValue === 'LinksField'">
              <v-col cols="12" md="6">
                <EditorFormSchemaPlaygroundEditDialogLinkSettings
                  :form-schema-element="formSchemaElement"
                  :object-schema-element="objectSchemaElement as IVeoObjectSchemaCustomLink"
                  :playground-element="playgroundElement"
                  :pointer="pointer"
                  @add="(elementPointer, element) => emit('add', elementPointer, element)"
                  @remove="(elementPointer) => emit('remove', elementPointer)"
                >
                  <slot />
                </EditorFormSchemaPlaygroundEditDialogLinkSettings>
              </v-col>
            </v-row>
          </v-card-text>
        </BaseCard>
      </h2>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { JSONSchema7 } from 'json-schema';
import { JsonPointer } from 'json-ptr';

import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { controlTypeAlternatives, eligibleInputElements, INPUT_ELEMENTS } from '~/types/VeoEditor';
import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { getFormSchemaControlType } from '~/lib/utils';
import type { IPlaygroundElement } from '../Element.vue';
import type { Ref } from 'vue';
import type { IVeoObjectSchemaCustomLink } from '~/types/VeoTypes';

const props = withDefaults(
  defineProps<{
    formSchemaElement: IVeoFormSchemaItem;
    pointer: string;
    playgroundElement: IPlaygroundElement;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void;
  (event: 'set-translation', translationKey: string, value: string | undefined): void;
  (event: 'add', pointer: string, element: IVeoFormSchemaItem): void;
  (event: 'remove', pointer: string, removeFromSchemaElementMap?: boolean): void;
}>();

const { t, locale } = useI18n();

// Some elements can be displayed with a different input, e.g. a text field can be displayed as a multiline input or with a WYSIWYG editor
const objectSchema = inject<Ref<JSONSchema7>>(FORMSCHEMA_PROVIDE_KEYS.OBJECTSCHEMA);
const objectSchemaElement = computed(
  () => JsonPointer.get(objectSchema?.value, props.formSchemaElement.scope as string) as JSONSchema7
); // Can't be undefined, as a control ALWAYS has a scope

const controlType = computed(() => getFormSchemaControlType(objectSchemaElement.value));
const inputType = computed(() =>
  props.formSchemaElement && objectSchemaElement.value ?
    eligibleInputElements(controlType.value, {
      ...props.formSchemaElement,
      schema: objectSchemaElement.value
    })[0]?.code
  : undefined
);
const elementInputAlternatives = computed(() =>
  (inputType.value ?
    controlTypeAlternatives(inputType.value, {
      elements: props.formSchemaElement.elements,
      options: props.formSchemaElement.options,
      schema: objectSchemaElement.value
    })
  : []
  )
    .map((element) => ({
      title: element.name[locale.value],
      subtitle: element.description[locale.value],
      value: element.code
    }))
    .sort((elementA, elementB) => elementA.title.localeCompare(elementB.title))
);

const elementTypeModelValue = computed({
  get: () => inputType.value,
  set: (newValue) => {
    emit('update:form-schema-element', {
      ...props.formSchemaElement,
      options: {
        label: props.formSchemaElement.options.label,
        ...INPUT_ELEMENTS.find((inputElement) => inputElement.code === newValue)?.options
      }
    });
  }
});

// Element specific options
const elementsWithOptions = ['Radio', 'LinksField'];
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-edit-dialog-control-element-settings.json"></i18n>
