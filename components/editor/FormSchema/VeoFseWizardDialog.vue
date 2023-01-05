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
  <VeoDialog
    :value="value"
    :headline="t('formSchemaEditor')"
    persistent
    fixed-footer
    :large="state !== WIZARD_STATES.START"
    :close-function="onClose"
    @update:model-value="$emit('model-value', $event)"
  >
    <template #default>
      <VeoLoadingWrapper v-if="loadingFormSchema || loadingObjectSchema" />
      <v-window :value="state">
        <VeoFseWizardStateStart
          :value="WIZARD_STATES.START"
          @create="state = WIZARD_STATES.CREATE"
          @import="state = WIZARD_STATES.IMPORT"
        />
        <VeoFseWizardStateCreate
          v-model:valid="createFormValid"
          v-model:object-type="objectSchemaId"
          :value="WIZARD_STATES.CREATE"
          :domain-id="domainId"
          :object-schema="objectSchema"
          v-bind="formSchemaDetails"
          v-on="createFormListeners"
          @update:object-schema="uploadedObjectSchema = $event"
        />
        <VeoFseWizardStateImport
          v-model:force-own-schema="forceOwnObjectSchema"
          v-model:form-schema-id="formSchemaId"
          :value="WIZARD_STATES.IMPORT"
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
        text
        @click="state = WIZARD_STATES.START"
      >
        {{ t('global.button.previous') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="(state === WIZARD_STATES.CREATE && !createFormValid) || (state === WIZARD_STATES.IMPORT && (!objectSchema || !formSchema || !schemasCompatible))"
        @click="state === WIZARD_STATES.CREATE ? createFormSchema() : importFormSchema()"
      >
        {{ t('global.button.next') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { nextTick } from 'process';
import { Dictionary, isEqual, merge, pick } from 'lodash';
import { JsonPointer } from 'json-ptr';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';

import { generateSchema, validate } from '~/lib/FormSchemaHelper';
import { IVeoFormSchema, IVeoObjectSchema, IVeoObjectSchemaTranslations, IVeoTranslations } from '~/types/VeoTypes';
import { useFetchForm } from '~/composables/api/forms';
import { useFetchSchema } from '~/composables/api/schemas';
import { useFetchTranslations } from '~/composables/api/translations';

enum WIZARD_STATES {
  START,
  CREATE,
  IMPORT
}

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['done', 'model-value'],
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const { t, locale } = useI18n();
    const { i18n } = useNuxtApp();

    // Display stuff
    const state = ref(WIZARD_STATES.START);

    watch(
      () => props.value,
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

    const fetchFormQueryParameters = computed(() => ({ domainId: props.domainId, id: formSchemaId.value || '' }));
    const fetchFormQueryEnabled = computed(() => !!formSchemaId.value && formSchemaId.value !== 'custom');
    const { data: remoteFormSchema, isFetching: loadingFormSchema } = useFetchForm(fetchFormQueryParameters, { enabled: fetchFormQueryEnabled });

    const formSchema = computed(() => {
      let schema = !formSchemaId.value || formSchemaId.value === 'custom' ? uploadedFormSchema.value : remoteFormSchema.value;
      if (schema) {
        // We add a slash infront of the replace in order to only replace the domain id in the scope property
        schema = JSON.parse(JSON.stringify(schema).replaceAll(`/${props.domainId}`, '/{CURRENT_DOMAIN_ID}'));
      }
      return schema;
    });

    const forceOwnObjectSchema = ref(false);
    const objectSchemaId = ref<string>();
    const uploadedObjectSchema = ref<IVeoObjectSchema>();

    const fetchSchemaQueryParameters = computed(() => ({ type: objectSchemaId.value || '', domainIds: [props.domainId] }));
    const fetchSchemaQueryEnabled = computed(() => !!objectSchemaId.value && objectSchemaId.value !== 'custom');
    const { data: remoteObjectSchema, isFetching: loadingObjectSchema } = useFetchSchema(fetchSchemaQueryParameters, { enabled: fetchSchemaQueryEnabled });

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
    const translationQueryParameters = computed(() => ({ languages: (i18n.locales as LocaleObject[]).map((locale) => locale.code) }));
    const { data: translations } = useFetchTranslations(translationQueryParameters);

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
      WIZARD_STATES
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
