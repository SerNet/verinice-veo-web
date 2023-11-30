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
  <v-sheet
    rounded
    border
    class="fill-width my-1 d-flex overflow-hidden"
    data-component-name="control-form-element"
  >
    <div
      class="handle mr-1 d-flex align-center px-1"
      :style="{ background: handleColor }"
    >
      <v-icon
        :icon="mdiDrag"
        color="white"
      />
    </div>
    <div
      class="overflow-hidden"
      style="flex-grow: 1"
    >
      <v-card-actions class="d-flex py-0">
        <EditorFormSchemaPlaygroundRuleIcon
          :rule="formSchemaElement.rule"
          class="mr-1"
        />
        {{ t('control') }} ({{ inputType }})
        <v-spacer />
        <v-btn
          :icon="mdiPencilOutline"
          size="small"
          @click="emit('edit')"
        />
        <v-btn
          :icon="mdiTrashCanOutline"
          size="small"
          @click="emit('delete')"
        />
      </v-card-actions>
      <div class="mx-2 mb-1">
        <EditorTranslationsTranslatedElementTitle
          :form-schema-element="formSchemaElement"
          tag="b"
          hide-if-missing
        >
          <template #default="{ translatedValue }">
            <span
              v-if="translatedValue"
              class="text-body-2"
              style="overflow-wrap: break-word"
            >
              ({{ attributeKey }})
            </span>
            <span
              v-else
              style="overflow-wrap: break-word"
            >
              <b>{{ attributeKey }}</b>
            </span>
          </template>
        </EditorTranslationsTranslatedElementTitle>
      </div>
    </div>
  </v-sheet>
</template>
  
<script setup lang="ts">
import { mdiDrag, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { JsonPointer } from 'json-ptr';
import { JSONSchema7 } from 'json-schema';
import { last } from 'lodash';

import { IPlaygroundElement } from './Element.vue';
import { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { eligibleInputElements, INPUT_TYPES as CONTROL_APPEARANCE_DEFINITIONS } from '~/types/VeoEditor';
import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { getFormSchemaControlType } from '~/lib/utils';

const props = withDefaults(defineProps<{
  playgroundElement: IPlaygroundElement;
  formSchemaElement: IVeoFormSchemaItem;
}>(), {});

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'delete'): void;
}>();

const { t } = useI18n();

const objectSchema = inject<Ref<JSONSchema7>>(FORMSCHEMA_PROVIDE_KEYS.OBJECTSCHEMA);
const objectSchemaElement = computed(() => JsonPointer.get(objectSchema?.value, props.formSchemaElement.scope as string) as JSONSchema7); // Can't be undefined, as a control ALWAYS has a scope
const controlType = computed(() => getFormSchemaControlType(objectSchemaElement.value));
const inputType = computed(() => props.formSchemaElement && objectSchemaElement.value ? eligibleInputElements(controlType.value, { ...props.formSchemaElement, schema: objectSchemaElement.value })[0].code : undefined);

const handleColor = computed(() => CONTROL_APPEARANCE_DEFINITIONS[controlType.value].color);
const attributeKey = computed(() => last(props.formSchemaElement.scope?.split('/')));
</script>

<i18n>
{
  "en": {
    "control": "control"
  },
  "de": {
    "control": "Control"
  }
}
</i18n>
