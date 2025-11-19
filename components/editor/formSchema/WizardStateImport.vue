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
  <v-window-item v-bind="$attrs">
    <h2 class="text-h2 mb-6">
      {{ t('importFormSchema') }}
    </h2>
    <h3 class="text-h3">
      {{ t('formSchema') }}
    </h3>
    <BaseCard class="full-width">
      <v-card-text>
        <v-select
          :model-value="formSchemaId"
          :label="t('formSchema')"
          :rules="[requiredRule]"
          :items="formSchemaOptions"
          required
          variant="underlined"
          data-veo-test="form-schema-select"
          @update:model-value="$emit('update:form-schema-id', $event)"
        />
        <EditorFileUpload
          v-if="formSchemaId === 'custom'"
          :input-label="t('formSchemaUploadLabel')"
          :submit-button-text="t('importFormSchema')"
          @schema-uploaded="$emit('update:form-schema', $event)"
        />
        <BaseAlert
          :model-value="objectTypeMissing || !schemasCompatible"
          :buttons="
            schemasCompatible ?
              []
            : [
                {
                  text: t('forceProceed'),
                  onClick: () => $emit('force-import')
                }
              ]
          "
          :type="!schemasCompatible && !objectTypeMissing ? VeoAlertType.INFO : VeoAlertType.ERROR"
          :title="!schemasCompatible && !objectTypeMissing ? t('objectSchemaIncompatible') : t('objectTypeMissing')"
          :text="t('uploadObjectSchemaHint')"
          class="my-4"
          flat
          no-close-button
        />
      </v-card-text>
    </BaseCard>
    <h3 class="text-h3 mt-6">
      {{ t('objectschema') }}
    </h3>
    <BaseCard class="full-width">
      <v-card-text>
        <v-checkbox
          :model-value="forceOwnSchema"
          :label="t('forceOwnSchema')"
          @update:model-value="$emit('update:force-own-schema', $event)"
        />
        <div v-if="forceOwnSchema">
          <EditorFileUpload
            :input-label="t('objectSchemaUploadLabel')"
            :submit-button-text="t('importObjectSchema')"
            @schema-uploaded="$emit('update:object-schema', $event)"
          />
        </div>
      </v-card-text>
    </BaseCard>
  </v-window-item>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { isObject } from 'lodash';

import type { IVeoFormSchema } from '~/composables/api/queryDefinitions/forms';
import formsQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import { VeoAlertType, VeoElementTypePlurals, RI_CONTROL_VIEW_CONTEXT } from '~/types/VeoTypes';
import { useQuery } from '~/composables/api/utils/query';

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    domainId: {
      type: String,
      required: true
    },
    forceOwnSchema: {
      type: Boolean,
      default: false
    },
    formSchemaId: {
      type: String,
      default: undefined
    },
    formSchema: {
      default: undefined,
      validator: (value: any) => value === undefined || isObject(value),
      type: Object as PropType<IVeoFormSchema | undefined>
    },
    schemasCompatible: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'update:object-schema',
    'update:force-own-schema',
    'force-import',
    'update:form-schema-id',
    'update:form-schema'
  ],
  setup(props) {
    const { t, locale } = useI18n();

    // display stuff
    function requiredRule(value: string) {
      return !!value || t('global.input.required').toString();
    }

    // formschema stuff
    const queryParameters = computed(() => ({ domainId: props.domainId }));
    const queryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas } = useQuery(formsQueryDefinitions.queries.fetchForms, queryParameters, {
      enabled: queryEnabled
    });

    const formSchemaOptions = computed<{ title: string; value: string }[]>(() => [
      {
        title: t('customFormSchema').toString(),
        value: 'custom'
      },
      ...(formSchemas.value || []).map((formSchema) => ({
        title: formSchema?.name[locale.value] || '',
        value: formSchema.id as string
      }))
    ]);

    // If the object schema belonging to the form schema doesn't exist, the user has to upload it themself
    const objectTypeMissing = computed(
      () =>
        props.formSchema &&
        !(
          (props.formSchema.context === RI_CONTROL_VIEW_CONTEXT && props.formSchema.modelType == null) ||
          Object.keys(VeoElementTypePlurals).includes(props.formSchema?.modelType as string)
        )
    );

    return {
      formSchemaOptions,
      objectTypeMissing,
      requiredRule,

      VeoAlertType,
      t
    };
  }
});
</script>

<i18n src="~/locales/base/components/editor-form-schema-wizard-state-import.json"></i18n>
