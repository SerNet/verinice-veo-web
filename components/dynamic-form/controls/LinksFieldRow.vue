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
        required
        :error-messages="getControlErrorMessages($props, '/properties/target')"
        value-as-link
        @update:model-value="$emit('update:model-value', $event)"
      >
        <template
          v-if="!objectCreationDisabled"
          #prepend-item
        >
          <v-btn
            block
            color="primary"
            variant="text"
            @click="createObjectDialogVisible = true"
          >
            <v-icon
              start
              :icon="mdiPlus"
            />
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
      <DynamicFormControlsLinksFieldRowAttribute v-bind="$props">
        <slot name="default" />
      </DynamicFormControlsLinksFieldRowAttribute>
    </div>
  </div>
</template>

<script lang="ts">
import { mdiPlus } from '@mdi/js';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';
import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoCustomLink } from '~/types/VeoTypes';
import formsQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import { PropType } from 'vue';
import { useQuery } from '~~/composables/api/utils/query';

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

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: {
    ...VeoFormsControlProps,
    otherSelectedLinks: {
      type: Array as PropType<IVeoCustomLink[]>,
      default: () => []
    },
    index: {
      type: Number,
      required: true
    }
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const route = useRoute();
    const config = useRuntimeConfig();
    const { t, locale } = useI18n();

    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);

    const objectType = computed<string>(() => ((props.objectSchema as any).items.properties.target.properties.type.enum[0] + '').toLowerCase());
    const subType = computed<string>(() => (props.objectSchema as any).items.properties.target.properties.subType?.enum?.[0]);

    const queryParameters = computed(() => ({ domainId: domainId.value }));
    const queryEnabled = computed(() => !!domainId.value);
    const { data: formSchemas } = useQuery(formsQueryDefinitions.queries.fetchForms, queryParameters, { enabled: queryEnabled });

    const createButtonLabel = computed(() =>
      subType.value ? formSchemas.value?.find((formSchema) => formSchema.subType === subType.value)?.name?.[locale.value] || objectType.value : objectType.value
    );

    // new object creation
    const createObjectDialogVisible = ref(false);
    const { data: schemas } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
    const onTargetCreated = (newElementId: string) => {
      emit('update:model-value', { targetUri: `${config.public.apiUrl}/${schemas.value?.[objectType.value]}/${newElementId}` });
    };

    // Users should only be able to select an item once per link, thus we have to remove all already selected items from the VeoObjectSelect
    const hiddenValues = computed(() => props.otherSelectedLinks.filter((link) => link.target?.targetUri).map((link) => getEntityDetailsFromLink(link.target).id));

    return {
      createButtonLabel,
      createObjectDialogVisible,
      domainId,
      hiddenValues,
      objectType,
      onTargetCreated,
      subType,

      getControlErrorMessages,
      mdiPlus,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "create": "create {0}"
  },
  "de": {
    "create": "{0} erstellen"
  }
}
</i18n>
