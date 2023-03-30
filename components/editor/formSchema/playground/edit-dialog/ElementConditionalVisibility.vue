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
  <section class="mt-4">
    <h2 class="text-h2">
      {{ t('conditionalVisibility') }}
    </h2>
    <BaseCard>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="6"
            class="d-flex flex-row"
          >
            <v-select
              v-model="conditionEffect"
              data-component-name="form-element-conditional-visibility"
              :label="t('effect')"
              :items="options"
              clearable
              :prepend-inner-icon="mdiMagicStaff"
              variant="underlined"
            />
            <v-tooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  variant="text"
                  :disabled="!formSchemaElement.rule"
                  :icon="mdiTrashCanOutline"
                  v-bind="tooltipProps"
                  @click="deleteRule"
                />
              </template>
              <template #default>
                {{ t('deleteRule') }}
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row v-if="conditionEffect">
          <v-col
            cols="12"
            md="6"
          >
            <v-combobox
              v-model="scopeUUID"
              :label="t('linkedElement')"
              variant="underlined"
              :items="availableScopes"
              :prepend-inner-icon="mdiFormTextbox"
            >
              <template #item="{ item, props: itemProps }">
                <v-list-item
                  v-bind="itemProps"
                  :active="scopeUUID === item.value"
                  :title="undefined"
                  two-line
                  style="max-width: 500px"
                >
                  <v-list-item-title>
                    <EditorTranslationsTranslatedElementTitle :form-schema-element="<any>formSchemaElementMap.get(item.value)" />
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formSchemaElementMap.get(item.value)?.scope }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
              <template #selection>
                <EditorTranslationsTranslatedElementTitle
                  v-if="selectedScopeFormSchemaElement"
                  :form-schema-element="selectedScopeFormSchemaElement"
                />
              </template>
            </v-combobox>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-select
              v-if="selectedScopeHasPredefinedValues"
              v-model="conditionValues"
              :label="t('hasValue')"
              :items="selectedScopeObjectSchemaElement?.enum || []"
              variant="underlined"
              multiple
              :prepend-inner-icon="mdiAlphabetical"
            />
            <v-text-field
              v-else
              v-model="conditionValues"
              :label="t('hasValue')"
              variant="underlined"
              :prepend-inner-icon="mdiAlphabetical"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </BaseCard>
  </section>
</template>

<script setup lang="ts">
import { PropType, Ref } from 'vue';
import { cloneDeep, isArray } from 'lodash';
import { mdiAlphabetical, mdiFormTextbox, mdiMagicStaff, mdiTrashCanOutline } from '@mdi/js';
import { JsonPointer } from 'json-ptr';
import { JSONSchema7 } from 'json-schema';

import { FormSchemaElementMap, PROVIDE_KEYS as PLAYGROUND_PROVIDE_KEYS } from '../Playground.vue';
import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { IVeoFormSchemaItem } from '~~/composables/api/queryDefinitions/forms';

const props = defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void
}>();

const { t } = useI18n();

const options = computed(() => [
  {
    title: t('hide'),
    value: 'HIDE'
  },
  {
    title: t('show'),
    value: 'SHOW'
  }
]);

const conditionEffect = ref<'HIDE' | 'SHOW' | undefined>();

// Read/write Note: We don't use computeds here as in most other input components, as we only want to update the form schema element if the rule AND scope/value have been set
const scopeUUID = ref<string>();
const selectedScopeFormSchemaElement = computed(() => scopeUUID.value ? formSchemaElementMap.value.get(scopeUUID.value) : undefined);

const objectSchema = inject<Ref<JSONSchema7>>(FORMSCHEMA_PROVIDE_KEYS.objectSchema);
const selectedScopeObjectSchemaElement = computed(() => selectedScopeFormSchemaElement.value?.scope && objectSchema?.value ? JsonPointer.get(objectSchema?.value, selectedScopeFormSchemaElement.value.scope) as JSONSchema7 : undefined);

const selectedScopeHasPredefinedValues = computed(() => !!selectedScopeObjectSchemaElement?.value?.enum);
const conditionValues = ref<any>(undefined);

const _formSchemaElementMap = inject<FormSchemaElementMap>(PLAYGROUND_PROVIDE_KEYS.formSchemaElementMap, new Map());
const formSchemaElementMap = ref<FormSchemaElementMap>(new Map());

// For some reason we have to watch, as vue doesn't pick up the changes
watch(() => _formSchemaElementMap, (newValue: any) => {
  formSchemaElementMap.value = unref(newValue);
}, { deep: true, immediate: true });
const availableScopes = computed(() => [...formSchemaElementMap.value]
  .filter(([_uuid, element]) => element.scope && element.type !== 'LinksField' && (!props.formSchemaElement.scope || !element.scope.includes(props.formSchemaElement.scope)))
  .map(([uuid, _element]) => uuid)
);

const onConditionUpdated = () => {
  if(conditionEffect.value && selectedScopeFormSchemaElement.value && conditionValues.value?.length) {
    emit('update:form-schema-element', { ...props.formSchemaElement, rule: {
      effect: conditionEffect.value,
      condition: {
        scope: selectedScopeFormSchemaElement.value.scope as string,
        schema: {
          enum: isArray(conditionValues.value) ? conditionValues.value : [conditionValues.value]
        }
      }
    } });
  }
};

const onFormSchemaItemModified = (newValue: IVeoFormSchemaItem) => {
  conditionEffect.value = newValue.rule?.effect;
  scopeUUID.value = [...formSchemaElementMap.value].find(([_uuid, element]) => element.scope === newValue.rule?.condition?.scope)?.[0];
  conditionValues.value = newValue.rule?.condition?.schema?.enum || [];
};

const deleteRule = () => {
  const oldFormSchemaElement = cloneDeep(props.formSchemaElement);
  delete oldFormSchemaElement.rule;
  emit('update:form-schema-element', oldFormSchemaElement);
};

watch(() => conditionEffect.value, onConditionUpdated);
watch(() => scopeUUID.value, onConditionUpdated);
watch(() => conditionValues.value, onConditionUpdated);
watch(() => props.formSchemaElement, onFormSchemaItemModified, { deep: true, immediate: true });
</script>

<i18n>
{
  "en": {
    "conditionalVisibility": "Conditional visibility",
    "deleteRule": "Delete rule",
    "effect": "Effect",
    "hasValue": "has value",
    "hide": "Hide if rule applies",
    "linkedElement": "Linked element",
    "show": "Show if rule applies"
  },
  "de": {
    "conditionalVisibility": "Bedingte Sichtbarkeit",
    "deleteRule": "Regel löschen",
    "effect": "Effekt",
    "hasValue": "hat Wert",
    "hide": "Ausblenden falls Regel zutrifft",
    "linkedElement": "Verknüpftes Element",
    "show": "Anzeigen falls Regel zutrifft"
  }
}
</i18n>
