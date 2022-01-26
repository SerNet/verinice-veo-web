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
    fixed-header
    fixed-footer
    :large="state !== WIZARD_STATES.START"
    :close-function="onClose"
    v-on="$listeners"
  >
    <template #default>
      <VeoLoadingWrapper v-if="loadingQueries" />
      <v-window :value="state">
        <VeoFseWizardStateStart
          :value="WIZARD_STATES.START"
          @create="state = WIZARD_STATES.CREATE"
          @import="state = WIZARD_STATES.IMPORT"
        />
        <VeoFseWizardStateCreate
          :value="WIZARD_STATES.CREATE"
          :domain-id="domainId"
          :valid="createFormValid"
          v-bind="formSchemaDetails"
          :object-schema="objectSchema"
          v-on="createFormListeners"
        />
        <VeoFseWizardStateImport
          :value="WIZARD_STATES.IMPORT"
          :domain-id="domainId"
          :force-own-schema.sync="forceOwnSchema"
          :form-schema-id="formSchemaId"
          :form-schema.sync="formSchema"
          :object-schema="objectSchema"
          :schemas-compatible="schemasCompatible"
          @forceImport="importFormSchema()"
          @update:formSchemaId="onUpdateFormSchemaId"
          @newObjectType="loadObjectSchema"
          @update:objectSchema="setObjectSchema($event)"
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
import { defineComponent, useRoute, useRouter, ref, watch, Ref, useContext, set, computed, useAsync } from '@nuxtjs/composition-api';
import { Dictionary, isEqual, merge, pick } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { JsonPointer } from 'json-ptr';
import { generateSchema, validate } from '~/lib/FormSchemaHelper';
import { IVeoFormSchema, IVeoObjectSchema, IVeoObjectSchemaTranslations, IVeoTranslations } from '~/types/VeoTypes';

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
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const { t, locale } = useI18n();
    const { $api } = useContext();

    // Display stuff
    const state = ref(WIZARD_STATES.START);
    const loadingQueries = ref(0);

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

    async function calculateStateBasedOnRoute() {
      state.value = WIZARD_STATES.START;

      // Extract data from url
      forceOwnSchema.value = !!route.value.query.forceOwnSchema;
      formSchemaDetails.value = pick(route.value.query, ['name', 'sorting', 'objectType', 'subType']) as Dictionary<string | null>;

      // If the user wants to open the formschema editor with a custom formSchema, show import form schema form
      if (route.value.query.formSchema === 'custom') {
        formSchemaId.value = 'custom';
        state.value = WIZARD_STATES.IMPORT;
        return;
      }

      // If the user wants to open the formschema editor with an existing form schema, load form and object schema
      if (route.value.query.formSchema) {
        formSchemaId.value = route.value.query.formSchema as string;
        state.value = WIZARD_STATES.IMPORT;

        if (formSchemaId.value !== 'custom') {
          await loadFormSchema(route.value.query.formSchema as string);

          if (!forceOwnSchema.value) {
            await loadObjectSchema((formSchema.value as IVeoFormSchema).modelType);
            emitSchemas();
          }
        }
        return;
      }

      // If no formSchema is set but other data show create form
      if (!isEqual(formSchemaDetails.value, {})) {
        state.value = WIZARD_STATES.CREATE;

        if (formSchemaDetails.value.objectType && formSchemaDetails.value.objectType !== 'custom') {
          await loadObjectSchema(formSchemaDetails.value.objectType as string);
        }

        // If all required properties are set create new formschema automatically
        if (['name', 'objectType', 'subType'].every((property) => Object.keys(formSchemaDetails.value).includes(property)) && formSchemaDetails.value.objectType !== 'custom') {
          createFormSchema();
        }
      }
    }

    function onClose() {
      router.push({
        name: 'unit-domains-domain-editor'
      });
      return true;
    }

    // form schema stuff
    const formSchema: Ref<IVeoFormSchema | undefined> = ref(undefined);
    const formSchemaDetails: Ref<{ name?: string; objectType?: string; subType?: string; sorting?: string }> = ref({});

    async function loadFormSchema(id: string) {
      loadingQueries.value++;
      formSchema.value = await $api.form.fetch(id);
      loadingQueries.value--;
    }

    // object schema stuff
    const objectSchema: Ref<IVeoObjectSchema | undefined> = ref(undefined);
    const existingTranslations = useAsync(() => $api.translation.fetch([]));

    async function loadObjectSchema(objectType: string) {
      loadingQueries.value++;
      setObjectSchema(await $api.schema.fetch(objectType, [props.domainId]));
      loadingQueries.value--;
    }

    // create stuff
    const createFormValid = ref(true);

    function createFormSchema() {
      // we typecast in the following function call, as the form validation makes sure, that all values have been set
      formSchema.value = generateSchema(
        { [locale.value]: formSchemaDetails.value.name as string },
        objectSchema.value?.title as string,
        formSchemaDetails.value.subType as string,
        formSchemaDetails.value.sorting || null
      );
      if (!isEqual(route.value.query, formSchemaDetails.value)) {
        router.push({
          query: formSchemaDetails.value
        });
      }
      emitSchemas();
    }

    const createFormListeners = {
      'update:name': (newValue: string) => set(formSchemaDetails.value, 'name', newValue),
      'update:sorting': (newValue: string) => set(formSchemaDetails.value, 'sorting', newValue),
      'update:objectType': (newValue: string) => {
        objectSchema.value = undefined;
        if (newValue !== 'custom') {
          loadObjectSchema(newValue);
        }
        set(formSchemaDetails.value, 'objectType', newValue);
        set(formSchemaDetails.value, 'subType', undefined);
      },
      'update:subType': (newValue: string) => set(formSchemaDetails.value, 'subType', newValue),
      'update:valid': (newValue: boolean) => (createFormValid.value = newValue),
      'update:objectSchema': (newValue: IVeoObjectSchema | undefined) => setObjectSchema(newValue),
      submit: () => (createFormValid.value ? createFormSchema() : () => {})
    };

    // import stuff
    const forceOwnSchema = ref(false);
    const formSchemaId: Ref<undefined | string> = ref(undefined);

    function importFormSchema() {
      const queryParams = {
        formSchema: formSchemaId.value as string,
        forceOwnSchema: forceOwnSchema.value ? forceOwnSchema.value + '' : undefined
      };

      if (!isEqual(route.value.query, queryParams)) {
        router.push({
          query: queryParams
        });
      }
      emitSchemas();
    }

    function onUpdateFormSchemaId(newValue: string) {
      formSchemaId.value = newValue;
      if (newValue !== 'custom') {
        loadFormSchema(newValue);
      }
    }

    function setObjectSchema(newValue: any) {
      objectSchema.value = JSON.parse(JSON.stringify(newValue).replaceAll(props.domainId, '{CURRENT_DOMAIN_ID}'));
    }

    function emitSchemas() {
      const mergedTranslations: IVeoTranslations = { lang: {} };
      const osTranslations = (JsonPointer.get(objectSchema, '#/properties/translations') || {}) as IVeoObjectSchemaTranslations | {};

      mergedTranslations.lang = merge(existingTranslations.value?.lang, osTranslations);
      if (osTranslations) {
        JsonPointer.unset(objectSchema, '#/properties/translations');
      }

      emit('objectSchema', objectSchema.value);
      emit('formSchema', formSchema.value);
      emit('translations', mergedTranslations);
    }

    const schemasCompatible = computed(() => formSchema.value && objectSchema.value && validate(formSchema.value, objectSchema.value).valid);

    return {
      createFormListeners,
      createFormSchema,
      createFormValid,
      forceOwnSchema,
      formSchema,
      formSchemaDetails,
      formSchemaId,
      importFormSchema,
      loadFormSchema,
      loadObjectSchema,
      loadingQueries,
      objectSchema,
      onClose,
      onUpdateFormSchemaId,
      schemasCompatible,
      setObjectSchema,
      state,

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