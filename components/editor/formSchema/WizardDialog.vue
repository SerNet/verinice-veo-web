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
  <BaseDialog
    :model-value="modelValue"
    :title="t('formSchemaEditor')"
    confirm-close
    fixed-footer
    :large="state !== WIZARD_STATES.START"
    :close-function="onClose"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <LayoutLoadingWrapper v-if="loadingFormSchema || loadingObjectSchema" />
      <v-window :model-value="state">
        <EditorFormSchemaWizardStateStart
          :model-value="WIZARD_STATES.START"
          @create="state = WIZARD_STATES.CREATE"
          @import="state = WIZARD_STATES.IMPORT"
        />
        <EditorFormSchemaWizardStateCreate
          v-bind="mergeProps(formSchemaDetails, createFormListeners)"
          v-model:valid="createFormValid"
          v-model:object-type="objectSchemaId"
          v-model:sub-type="formSchemaDetails.subType"
          v-model:name="formSchemaDetails.name"
          v-model:sorting="formSchemaDetails.sorting"
          :model-value="WIZARD_STATES.CREATE"
          :domain-id="domainId"
          :object-schema="objectSchema"
          @update:object-schema="uploadedObjectSchema = $event"
        />
        <EditorFormSchemaWizardStateImport
          v-model:force-own-schema="forceOwnObjectSchema"
          v-model:form-schema-id="formSchemaId"
          :model-value="WIZARD_STATES.IMPORT"
          :domain-id="domainId"
          :form-schema="formSchema"
          :schemas-compatible="schemasCompatible"
          @force-import="importFormSchema()"
          @update:form-schema="uploadedFormSchema = $event"
          @update:object-schema="uploadedObjectSchema = $event"
        />
      </v-window>
    </template>
    <template
      v-if="state !== WIZARD_STATES.START"
      #dialog-options
    >
      <v-btn
        variant="text"
        @click="state = WIZARD_STATES.START"
      >
        {{ globalT('global.button.previous') }}
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :disabled="(state === WIZARD_STATES.CREATE && createFormValid === false) || (state === WIZARD_STATES.IMPORT && (!objectSchema || !formSchema || !schemasCompatible))"
        @click="state === WIZARD_STATES.CREATE ? createFormSchema() : importFormSchema()"
      >
        {{ globalT('global.button.next') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { mergeProps } from 'vue';
import { Dictionary, isEqual, merge, pick } from 'lodash';
import { JsonPointer } from 'json-ptr';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';

import { generateSchema, validate } from '~/lib/FormSchemaHelper';
import { IVeoObjectSchema, IVeoObjectSchemaTranslations } from '~/types/VeoTypes';
import formsQueryDefinitions, { IVeoFormSchema } from '~/composables/api/queryDefinitions/forms';
import schemaQueryDefinitions, { IVeoFetchSchemaParameters } from '~/composables/api/queryDefinitions/schemas';
import translationQueryDefinitions, { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~~/composables/api/utils/query';

enum WIZARD_STATES {
  START,
  CREATE,
  IMPORT
}

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['done', 'update:model-value'],
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const { t, locale, locales } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });

    // Display stuff
    const state = ref(WIZARD_STATES.START);

    watch(
      () => props.modelValue,
      (newValue: boolean, oldValue: boolean | undefined) => {
        if (!oldValue && newValue) {
          nextTick(() => {
            calculateStateBasedOnRoute();
          });
        }
      },
      {
        immediate: true
      }
    );

    function calculateStateBasedOnRoute() {
      state.value = WIZARD_STATES.START;

      // Extract data from url
      forceOwnObjectSchema.value = !!route.query.forceOwnSchema;
      objectSchemaId.value = (route.query.objectType as string) || undefined;
      formSchemaId.value = (route.query.formSchema as string) || undefined;
      formSchemaDetails.value = pick(route.query, ['name', 'sorting', 'subType']) as Dictionary<string | null>;

      // If the user wants to open a specific form schema, show the upload page to allow him to upload his own schema or select an object schema if he wishes to
      if (formSchemaId.value) {
        state.value = WIZARD_STATES.IMPORT;
        return;
      }

      // If no formSchema is set but other data show create form
      if (Object.keys(formSchemaDetails.value).length || objectSchemaId.value) {
        state.value = WIZARD_STATES.CREATE;

        // If all required properties are set create new formschema automatically
        if (['name', 'subType'].every((property) => Object.keys(formSchemaDetails.value).includes(property)) && objectSchemaId.value !== 'custom') {
          createFormSchema();
          watch(
            () => objectSchema.value,
            (newValue) => {
              if (newValue) {
                createFormSchema();
              }
            },
            { immediate: true, deep: true }
          );
        }
      }
    }

    function onClose() {
      router.push({
        name: 'unit-domains-domain-editor'
      });
      return true;
    }

    // form and objectschema stuff
    const formSchemaDetails = ref<{ name?: string; subType?: string; sorting?: string }>({});

    const formSchemaId = ref<string>();
    const uploadedFormSchema = ref<IVeoFormSchema>();

    const fetchFormQueryParameters = computed(() => ({ domainId: props.domainId as string, id: formSchemaId.value || '' }));
    const fetchFormQueryEnabled = computed(() => !!formSchemaId.value && formSchemaId.value !== 'custom');
    const { data: remoteFormSchema, isFetching: loadingFormSchema } = useQuery(formsQueryDefinitions.queries.fetchForm, fetchFormQueryParameters, { enabled: fetchFormQueryEnabled });

    const formSchema = computed(() => {
      let schema = !formSchemaId.value || formSchemaId.value === 'custom' ? uploadedFormSchema.value : remoteFormSchema.value;
      if (schema) {
        // We add a slash infront of the replace in order to only replace the domain id in the scope property
        schema = JSON.parse(JSON.stringify(schema).replaceAll(`/${props.domainId}`, '/{CURRENT_DOMAIN_ID}'));
      }
      return schema;
    });
    const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);

    const forceOwnObjectSchema = ref(false);
    const objectSchemaId = ref<string>();
    const uploadedObjectSchema = ref<IVeoObjectSchema>();

    const objectTypePlural = computed(() => endpoints.value?.[objectSchemaId.value || '']);
    const fetchSchemaQueryParameters = computed<IVeoFetchSchemaParameters>(() => ({ type: objectTypePlural.value || '', domainId: props.domainId }));
    const fetchSchemaQueryEnabled = computed(() => !!objectTypePlural.value);
    const { data: remoteObjectSchema, isFetching: loadingObjectSchema } = useQuery(schemaQueryDefinitions.queries.fetchSchema, fetchSchemaQueryParameters, { enabled: fetchSchemaQueryEnabled });

    const objectSchema = computed(() => {
      let schema = forceOwnObjectSchema.value || objectSchemaId.value === 'custom' ? uploadedObjectSchema.value : remoteObjectSchema.value;
      if (schema) {
        schema = JSON.parse(JSON.stringify(schema).replaceAll(props.domainId, '{CURRENT_DOMAIN_ID}'));
      }
      return schema;
    });

    watch(
      () => formSchemaId.value,
      (newValue) => {
        if (newValue !== 'custom') {
          uploadedFormSchema.value = undefined;
        }
      }
    );

    watch(
      () => formSchema.value,
      (newValue) => {
        if (newValue && !forceOwnObjectSchema.value) {
          objectSchemaId.value = newValue.modelType;
        }
      }
    );

    watch(
      () => objectSchemaId.value,
      (newValue) => {
        if (newValue !== 'custom') {
          uploadedObjectSchema.value = undefined;
        }
      }
    );

    // translation stuff
    const translationQueryParameters = computed(() => ({ languages: (locales.value as LocaleObject[]).map((locale) => locale.code), domain: props.domainId }));
    const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, translationQueryParameters);

    // create stuff
    const createFormValid = ref(true);

    function createFormSchema() {
      if (!objectSchema.value) {
        // eslint-disable-next-line no-console
        console.warn('VeoFseWiardDialog::Object schema missing. Cannot create form schema');
        return;
      }

      // we typecast in the following function call, as the form validation makes sure, that all values have been set
      uploadedFormSchema.value = generateSchema(
        { [locale.value]: formSchemaDetails.value.name as string },
        objectSchema.value?.title as string,
        formSchemaDetails.value.subType as string,
        formSchemaDetails.value.sorting || null
      );
      if (!isEqual(route.query, formSchemaDetails.value)) {
        router.push({
          query: {
            objectType: objectSchemaId.value,
            ...formSchemaDetails.value
          }
        });
      }
      emitSchemas();
    }

    const createFormListeners = {
      'update:name': (newValue: string) => formSchemaDetails.value['name'] = newValue,
      'update:sorting': (newValue: string) => formSchemaDetails.value['sorting'] = newValue,
      'update:sub-type': (newValue: string) => formSchemaDetails.value['subType'] = newValue,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      submit: () => (createFormValid.value ? createFormSchema() : () => {})
    };

    // import stuff

    function importFormSchema() {
      const queryParams = {
        formSchema: formSchemaId.value as string,
        forceOwnSchema: forceOwnObjectSchema.value ? forceOwnObjectSchema.value + '' : undefined
      };

      if (!isEqual(route.query, queryParams)) {
        router.push({
          query: queryParams
        });
      }
      emitSchemas();
    }

    function emitSchemas() {
      const mergedTranslations: IVeoTranslations = { lang: {} };
      const osTranslations = (JsonPointer.get(objectSchema, '#/properties/translations') || {}) as IVeoObjectSchemaTranslations | Record<string, never>;

      mergedTranslations.lang = merge(translations.value?.lang, osTranslations);
      if (osTranslations) {
        JsonPointer.unset(objectSchema, '#/properties/translations');
      }

      emit('done', { objectSchema: objectSchema.value, formSchema: formSchema.value, translations: mergedTranslations });
    }

    const schemasCompatible = computed(() => formSchema.value && objectSchema.value && validate(formSchema.value, objectSchema.value).valid);

    return {
      createFormListeners,
      createFormSchema,
      createFormValid,
      forceOwnObjectSchema,
      formSchema,
      formSchemaDetails,
      formSchemaId,
      importFormSchema,
      loadingFormSchema,
      loadingObjectSchema,
      objectSchema,
      objectSchemaId,
      onClose,
      schemasCompatible,
      state,
      uploadedFormSchema,
      uploadedObjectSchema,

      t,
      globalT,
      WIZARD_STATES,
      mergeProps
    };
  }
});
</script>

<i18n>
{
  "en": {
    "formSchemaEditor": "Form schema editor"
  },
  "de": {
    "formSchemaEditor": "Formschema Editor"
  }
}
</i18n>
