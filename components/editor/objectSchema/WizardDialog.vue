<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Samuel Vitzthum
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
  <BaseDialog :title="$t('editor.objectschema.headline')" :close-function="onClose" confirm-close large>
    <template #default>
      <v-window>
        <v-window-item value="import" class="px-4">
          <h2 class="text-h2">
            {{ t('openObjectSchema') }}
          </h2>
          <v-row no-gutters class="align-center mt-4">
            <v-col cols="12" :md="5">
              <span style="font-size: 1.2rem"> {{ t('type') }}*: </span>
            </v-col>
            <v-col cols="12" :md="5">
              <v-select
                v-model="modelType"
                :label="t('type')"
                :items="availableObjectSchemas"
                required
                data-veo-test="object-schema-select"
                variant="underlined"
              />
            </v-col>
          </v-row>
          <v-row v-if="modelType === 'custom'">
            <v-col cols="12">
              <EditorFileUpload :code="code" :input-label="t('uploadLabel')" @schema-uploaded="openSchema" />
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        v-if="modelType !== 'custom'"
        color="primary"
        variant="text"
        type="submit"
        data-veo-test="open-object-schema-button"
        :disabled="importNextDisabled"
        @click="openSchema()"
      >
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { isEmpty, isEqual, isString } from 'lodash';

import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import { useQueryClient } from '@tanstack/vue-query';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

interface CompletedPayload {
  schema?: any;
  meta?: {
    type: string;
    description: string;
  };
}
const emit = defineEmits<{ completed: [data: CompletedPayload] }>();

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const queryClient = useQueryClient();

// Layout stuff
const isNavigatedByDialog = computed(() => isEmpty(route.query));
const isDialogCustom = computed(() => route.query.os === 'custom');

// Import stuff
const code = ref();
const modelType = ref();

const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain
}));
const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters);

const availableObjectSchemas = computed(() =>
  Object.keys(VeoElementTypePlurals)
    .map((objectType) => ({
      title: translations.value?.lang[locale.value]?.[objectType] || '',
      value: objectType
    }))
    .concat({ title: t('uploadJson'), value: 'custom' })
);

const importNextDisabled = computed(() => (modelType.value === 'custom' && !code.value) || !modelType.value);

const openSchema = async (schema?: any) => {
  if (schema) {
    emit('completed', { schema, meta: undefined });
    await navigateTo({ os: 'custom' });
  } else {
    const _schema = await useQuerySync(
      schemaQueryDefinitions.queries.fetchSchemaLegacy,
      { type: modelType.value || '', domainId: route.params.domain as string },
      queryClient
    );
    emit('completed', { schema: _schema, meta: undefined });
    await navigateTo({ os: modelType.value });
  }
};

const onClose = () => {
  router.push({
    name: 'unit-domains-domain-editor'
  });
  return true;
};
const navigateTo = (params: Record<string, any>) => {
  // If the current path does not match with new url, only then change the URL
  if (!isEqual(route.query, params)) {
    router.push({
      name: 'unit-domains-domain-editor-objectschema',
      query: params
    });
  }
};

watch(
  () => route,
  (newValue) => {
    // If the user navigates by URL, depending on the parameters, schemas should be generated
    if (!isNavigatedByDialog.value || isDialogCustom.value) {
      if (newValue.query.os === 'custom') {
        // If a user navigates through a URL which has custom os parameter,
        // the dialog with selected custom OS should be opened
        modelType.value = 'custom';
      } else if (isString(newValue.query.os) && newValue.query.os !== 'custom') {
        // If a user navigates through a URL which has os parameter different from 'custom'
        // (e.g. 'process', 'asset', etc.), the OS should be automatically loaded from the server
        modelType.value = newValue.query.os;
        openSchema();
      }
    } else if (isEmpty(newValue.query)) {
      code.value = '';
      modelType.value = '';
      emit('completed', {});
    }
  },
  { deep: true, immediate: true }
);
</script>

<i18n src="~/locales/base/components/editor-object-schema-wizard-dialog.json"></i18n>
