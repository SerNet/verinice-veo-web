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
  <div class="d-flex flex-column">
    <div>
      <UtilObjectSelect
        :model-value="modelValue"
        :object-type="objectType"
        :sub-type="subType"
        :label="options.label"
        :disabled="disabled"
        :domain-id="domainId"
        :hidden-values="hiddenValues"
        :error-messages="getControlErrorMessages($props, '/properties/target')"
        @update:model-value="$emit('update:model-value', $event)"
      >
        <template v-if="!objectCreationDisabled" #prepend-item>
          <v-btn
            block
            color="primary"
            variant="text"
            data-veo-test="create-object-button"
            @click="createObjectDialogVisible = true"
          >
            <v-icon start :icon="mdiPlus" />
            {{ t('create', [createButtonLabel]).toString() }}
          </v-btn>
        </template>
      </UtilObjectSelect>
      <ObjectCreateDialog
        v-if="createObjectDialogVisible"
        v-model="createObjectDialogVisible"
        :object-type="objectType"
        :sub-type="subType"
        :domain-id="domainId"
        @success="onTargetCreated"
      />
    </div>
    <div>
      <!-- @vue-ignore TODO #3066 not assignable -->
      <DynamicFormControlsLinksFieldRowAttribute v-bind="$props">
        <slot name="default" />
      </DynamicFormControlsLinksFieldRowAttribute>
    </div>
  </div>
</template>

<script lang="ts">
export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-links-field-row',
  name: {
    en: 'links field row',
    de: 'Link-Feld-Eintrag'
  },
  description: {
    en: 'Row of the links field. Not used independently.',
    de: 'Einzelner Eintrag des Link-Feldes. Wird nicht alleine genutzt.'
  }
};
</script>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import formsQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import { useQuery } from '~/composables/api/utils/query';

import type { IVeoCustomLink, IVeoLink } from '~/types/VeoTypes';
import type { IDynamicFormElementOptions, IVeoFormsElementDefinition } from '../types';

import { getControlErrorMessages } from '../util';

interface Props {
  otherSelectedLinks?: IVeoCustomLink[];
  modelValue?: IVeoLink | undefined;
  options?: IDynamicFormElementOptions;
  index?: number | undefined;
  objectSchema?: any;
  disabled?: boolean;
  objectCreationDisabled?: boolean;
  objectSchemaPointer?: string;
  errors?: Map<string, string[]>;
  elementKey?: string;
  formSchemaPointer?: string;
  valuePointer?: string;
}

const props = withDefaults(defineProps<Props>(), {
  otherSelectedLinks: () => [],
  modelValue: undefined,
  options: () => ({ visible: true, disabled: false, label: '' }),
  index: 0,
  objectSchema: {},
  disabled: false,
  objectCreationDisabled: false,
  objectSchemaPointer: '',
  errors: () => new Map(),
  elementKey: '',
  formSchemaPointer: '',
  valuePointer: ''
});

const emit = defineEmits<{
  (event: 'update:model-value', value: IVeoLink | undefined): void;
}>();

// Localization and routing
const { t, locale } = useI18n();
const route = useRoute();

// Computed properties for domain and object schema
const domainId = computed(() => route.params.domain as string);
const objectType = computed<string>(() =>
  ((props.objectSchema as any)?.items?.properties?.target?.properties?.type?.enum?.[0] || '').toLowerCase()
);
const subType = computed<string>(
  () => (props.objectSchema as any)?.items?.properties?.target?.properties?.subType?.enum?.[0]
);

// Form schema query
const { data: formSchemas } = useQuery(
  formsQueryDefinitions.queries.fetchForms,
  computed(() => ({ domainId: domainId.value })),
  { enabled: computed(() => Boolean(domainId.value)) }
);

// Create button label based on form schema or object type
const createButtonLabel = computed(() =>
  subType.value ?
    formSchemas.value?.find((form) => form.subType === subType.value)?.name?.[locale.value] || objectType.value
  : objectType.value
);

// Object creation dialog visibility
const createObjectDialogVisible = ref(false);

// Schema query for object creation
const { data: schemas } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);

// Emits the newly created target ID
const { createLink } = useCreateLink();
const onTargetCreated = (newElementId: string) => {
  emit('update:model-value', newElementId ? createLink(schemas.value?.[objectType.value], newElementId) : undefined);
};

// Hidden values: exclude already selected items in the selector
const hiddenValues = computed(() =>
  props.otherSelectedLinks.filter((link) => link.target?.targetUri).map((link) => link.target.id)
);
</script>

<i18n src="~/locales/base/components/dynamic-form-controls-links-field-row.json"></i18n>
