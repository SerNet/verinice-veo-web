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
  <v-sheet rounded border class="fill-width my-1 d-flex overflow-hidden" data-component-name="control-form-element">
    <div class="handle mr-1 d-flex align-center px-1" :style="{ background: handleColor }">
      <v-icon :icon="mdiDrag" color="white" />
    </div>
    <div class="overflow-hidden" style="flex-grow: 1">
      <v-card-actions class="d-flex py-0">
        <EditorTranslationsTranslatedElementTitle :form-schema-element="formSchemaElement" tag="b" />
        <EditorFormSchemaPlaygroundRuleIcon :rule="formSchemaElement.rule" class="mr-1" />
        <span class="text-grey text--darken-4">{{ inputType }}</span>
        <v-spacer />
        <v-btn :icon="mdiPencilOutline" size="small" @click="emit('edit')" />
        <v-btn :icon="mdiTrashCanOutline" size="small" @click="emit('delete')" />
      </v-card-actions>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { mdiDrag, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { JsonPointer } from 'json-ptr';
import type { JSONSchema7 } from 'json-schema';

import type { IPlaygroundElement } from './Element.vue';
import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { eligibleInputElements, INPUT_TYPES as CONTROL_APPEARANCE_DEFINITIONS } from '~/types/VeoEditor';
import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { getFormSchemaControlType } from '~/lib/utils';

const props = withDefaults(
  defineProps<{
    playgroundElement: IPlaygroundElement;
    formSchemaElement: IVeoFormSchemaItem;
  }>(),
  {}
);

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'delete'): void;
}>();

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

const handleColor = computed(() => CONTROL_APPEARANCE_DEFINITIONS[controlType.value].color);
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-control-element.json"></i18n>
