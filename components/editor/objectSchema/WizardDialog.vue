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
  <BaseDialog
    :model-value="modelValue"
    :large="state !== 'start'"
    :title="$t('editor.objectschema.headline')"
    confirm-close
    :close-function="onClose"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <v-window v-model="state">
        <v-window-item
          value="start"
          class="py-4"
        >
          <h3 class="text-h3">
            {{ t('start') }}
          </h3>
          <v-list
            class="px-0 overflow-hidden"
            color="transparent"
          >
            <v-list-item
              lines="two"
              @click="state = 'create'"
            >
              <v-list-item-title class="font-weight-bold">
                {{ t('createObjectSchema') }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ t('createObjectSchemaDescription') }}</v-list-item-subtitle>
              <template #append>
                <v-icon
                  size="x-large"
                  :icon="mdiChevronRight"
                />
              </template>
            </v-list-item>
            <v-list-item
              lines="two"
              @click="state = 'import'"
            >
              <v-list-item-title class="font-weight-bold">
                {{ t('importObjectSchema') }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ t('importObjectSchemaDescription') }}</v-list-item-subtitle>
              <template #append>
                <v-icon
                  size="x-large"
                  :icon="mdiChevronRight"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-window-item>
        <v-window-item
          value="create"
          class="px-4"
        >
          <v-form
            v-model="createFormIsValid"
            @submit.prevent="createSchema()"
          >
            <h2 class="text-h2">
              {{ t('createObjectSchema') }}
            </h2>
            <v-row
              no-gutters
              class="align-center mt-4"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;"> {{ t('type') }}*: </span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-text-field
                  v-model="createForm.type"
                  :label="t('type')"
                  :rules="[requiredRule]"
                  required
                  variant="underlined"
                />
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="align-center mt-4"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;"> {{ t('description') }}*: </span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-text-field
                  v-model="createForm.description"
                  :label="t('description')"
                  :rules="[requiredRule]"
                  required
                  variant="underlined"
                />
              </v-col>
            </v-row>
          </v-form>
          <small>{{ $t('global.input.requiredfields') }}</small>
        </v-window-item>
        <v-window-item
          value="import"
          class="px-4"
        >
          <h2 class="text-h2">
            {{ t('importObjectSchema') }}
          </h2>
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              cols="12"
              :md="5"
            >
              <span style="font-size: 1.2rem;"> {{ t('type') }}*: </span>
            </v-col>
            <v-col
              cols="12"
              :md="5"
            >
              <v-select
                v-model="modelType"
                :label="t('type')"
                :items="availableObjectSchemas"
                required
                variant="underlined"
              />
            </v-col>
          </v-row>
          <v-row v-if="modelType === 'custom'">
            <v-col cols="12">
              <EditorFileUpload
                :code="code"
                :input-label="t('uploadLabel')"
                @schema-uploaded="importSchema"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <span
                style="text-decoration: undeline; font-weight: bold; cursor: pointer;"
                @click="state = 'create'"
              >
                {{ t('importObjectSchemaSwitch') }}
              </span>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </template>
    <template #dialog-options>
      <v-btn
        v-if="state !== 'start'"
        text
        @click="state = 'start'"
      >
        {{ $t('global.button.previous') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="state === 'create'"
        color="primary"
        text
        role="submit"
        type="submit"
        :disabled="createFormIsValid === false"
        @click="createSchema()"
      >
        {{ $t('global.button.next') }}
      </v-btn>
      <v-btn
        v-if="state === 'import' && modelType !== 'custom'"
        color="primary"
        text
        role="submit"
        type="submit"
        :disabled="importNextDisabled"
        @click="importSchema()"
      >
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { isEmpty, isEqual, isString } from 'lodash';
import { mdiChevronRight } from '@mdi/js';

import schemaQueryDefinitions from '~~/composables/api/queryDefinitions/schemas';
import translationQueryDefinitions from '~~/composables/api/queryDefinitions/translations';
import { useQuery, useQuerySync } from '~~/composables/api/utils/query';
import { useQueryClient } from '@tanstack/vue-query';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});
const emit = defineEmits(['update:model-value', 'completed']);

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const { requiredRule } = useRules();
const queryClient = useQueryClient();

// Layout stuff
const state = ref<'start' | 'import' | 'create'>('start');

watch(() => props.modelValue, (newValue) => {
  if(newValue) {
    state.value = 'import';
  }
});

const isNavigatedByDialog = computed(() => isEmpty(route.query));
const isDialogCustom = computed(() => route.query.os === 'custom');

// Create stuff
const createForm = ref({
  type: undefined,
  description: undefined
});

const createFormIsValid = ref(false);

// Import stuff
const code = ref();
const modelType = ref();

const { data: schemas } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters);

const availableObjectSchemas = computed(() => (Object.keys(schemas.value || {})).map((objectType) => ({ title: translations.value?.lang[locale.value]?.[objectType] || '', value: objectType })).concat({ title: t('customObjectSchema'), value: 'custom' }));

const importNextDisabled = computed(() => (modelType.value === 'custom' && !code.value) || !modelType.value);

const createSchema = async () => {
  emit('completed', {
    schema: undefined,
    meta: { type: createForm.value.type, description: createForm.value.description }
  });
  await navigateTo({
    type: createForm.value.type,
    description: createForm.value.description
  });
};
const importSchema = async (schema?: any) => {
  if (schema) {
    emit('completed', { schema, meta: undefined });
    await navigateTo({ os: 'custom' });
  } else {
    const _schema = await useQuerySync(schemaQueryDefinitions.queries.fetchSchema, { type: modelType.value, domainIds: [route.params.domain as string] }, queryClient);
    emit('completed', { schema: _schema, meta: undefined });
    await navigateTo({ os: modelType.value });
  }
};

const clearCreateForm = () => {
  createForm.value = {
    type: undefined,
    description: undefined
  };
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

watch(() => route, (newValue) => {
  // If the user navigates by URL, depending on the parameters, schemas should be generated
  if (!isNavigatedByDialog.value || isDialogCustom.value) {
    if (isString(newValue.query.type) && isString(newValue.query.description)) {
      // If a user navigates through a URL which has parameters type and description, new OS should be created
      createForm.value.type = newValue.query.type;
      createForm.value.description = newValue.query.description;
      createSchema();
    } else if (newValue.query.os === 'custom') {
      // If a user navigates through a URL which has custom os parameter,
      // the dialog with selected custom OS should be opened
      state.value = 'import';
      modelType.value = 'custom';
    } else if (isString(newValue.query.os) && newValue.query.os !== 'custom') {
      // If a user navigates through a URL which has os parameter different from 'custom'
      // (e.g. 'process', 'asset', etc.), the OS should be automatically loaded from the server
      state.value = 'import';
      modelType.value = newValue.query.os;
      importSchema();
    }
  } else if (isEmpty(newValue.query)) {
    state.value = 'start';
    code.value = '';
    modelType.value = '';
    clearCreateForm();
    emit('completed', {});
  }
}, { deep: true, immediate: true });
</script>

<i18n>
{
  "en": {
    "createObjectSchema": "Create object schema",
    "createObjectSchemaDescription": "Create a new object schema from scratch.",
    "format": "(.json)",
    "importObjectSchema": "Import object schema",
    "importObjectSchemaSwitch": "Create a new object schema instead",
    "importObjectSchemaDescription": "Import an existing object schema and modify it.",
    "uploadLabel": "Object schema upload @:format",
    "customObjectSchema": "Custom",
    "start": "How do you want to start?",
    "description": "Description",
    "type": "Type of the object schema"
  },
  "de": {
    "createObjectSchema": "Objektschema erstellen",
    "createObjectSchemaDescription": "Neues, leeres Objektschema erstellen",
    "format": "(.json)",
    "importObjectSchema": "Objektschema importieren",
    "importObjectSchemaDescription": "Bestehendes Objektschema importieren und modifizieren",
    "importObjectSchemaSwitch": "Stattdessen ein neues Objektschema erstellen",
    "uploadLabel": "Objektschema hochladen @:format",
    "customObjectSchema": "Eigenes",
    "start": "Wie möchten Sie starten?",
    "description": "Beschreibung",
    "type": "Typ des Objektschemas"
  }
}
</i18n>
