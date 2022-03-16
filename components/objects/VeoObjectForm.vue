<!--
   - verinice.veo web
   - Copyright (C) 2021  Samuel Vitzthum, Jonas Heitmann
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
  <VeoPageWrapper :page-widths="[8, 4]">
    <template #default>
      <VeoPage
        :id="scrollWrapperId"
        sticky-header
        :sticky-footer="!!$slots['append-form-fixed']"
      >
        <template #header>
          <v-row class="align-center mx-0 pb-4">
            <v-col cols="auto">
              <h3>{{ upperFirst(t('display').toString()) }}:</h3>
            </v-col>
            <v-col cols="auto">
              <v-select
                v-model="selectedDisplayOption"
                class="mt-n2"
                dense
                hide-details
                :items="displayOptions"
                :data-cy="$utils.prefixCyData($options, 'display-select')"
              />
            </v-col>
          </v-row>
          <v-divider />
        </template>
        <template #default>
          <slot name="prepend-form" />
          <VeoForm
            v-if="!$fetchState.pending && objectSchema && !loading"
            v-model="objectData"
            :schema="objectSchema"
            :ui="currentFormSchema && currentFormSchema.content"
            :general-translation="translations && translations[locale]"
            :custom-translation="currentFormSchema && currentFormSchema.translation && currentFormSchema.translation[locale]"
            :error-messages.sync="formErrors"
            :reactive-form-actions="reactiveFormActions"
            :disabled="disabled"
            :object-creation-disabled="objectCreationDisabled"
            :disable-sub-type-select="disableSubTypeSelect"
            :domain-id="domainId"
          />
          <VeoObjectFormSkeletonLoader v-else />
          <slot name="append-form" />
        </template>
        <template #footer>
          <slot name="append-form-fixed" />
        </template>
      </VeoPage>
      <VeoPage no-padding>
        <template #default>
          <VeoTabs
            v-cy-name="'form-tabs'"
            sticky-tabs
          >
            <template #tabs>
              <v-tab :disabled="!currentFormSchema || !formSchemaHasGroups">
                <v-icon v-text="mdiFormatListBulleted" />
              </v-tab>
              <v-tab v-if="!disableHistory">
                <v-icon
                  v-cy-name="'history-tab'"
                  v-text="mdiHistory"
                />
              </v-tab>
              <v-tab>
                <v-badge
                  :content="messages.errors.length + messages.warnings.length"
                  :value="messages.errors.length + messages.warnings.length > 0"
                  color="primary"
                  overlap
                >
                  <v-icon v-text="mdiInformationOutline" />
                </v-badge>
              </v-tab>
            </template>
            <template #items>
              <v-tab-item class="px-4">
                <VeoFormNavigation
                  v-if="currentFormSchema"
                  :form-schema="currentFormSchema && currentFormSchema.content"
                  :custom-translation="currentFormSchema && currentFormSchema.translation && currentFormSchema.translation[locale]"
                  class="mx-n4"
                  :scroll-wrapper-id="scrollWrapperId"
                />
              </v-tab-item>
              <v-tab-item v-if="!disableHistory">
                <VeoObjectHistory
                  v-if="objectData"
                  :object="objectData"
                  :loading="loading"
                  :object-schema="objectSchema"
                  v-on="$listeners"
                />
              </v-tab-item>
              <v-tab-item class="px-4">
                <VeoValidationResult
                  :result="messages"
                  warnings-visible
                />
              </v-tab-item>
            </template>
          </VeoTabs>
        </template>
      </VeoPage>
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropOptions, Ref, ref, useContext, useFetch, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst, merge } from 'lodash';
import { mdiFormatListBulleted, mdiHistory, mdiInformationOutline } from '@mdi/js';

import { IBaseObject } from '~/lib/utils';
import { useVeoReactiveFormActions } from '~/composables/VeoReactiveFormActions';
import { IVeoFormSchema, IVeoFormSchemaMeta, IVeoObjectSchema, IVeoReactiveFormAction, IVeoTranslationCollection } from '~/types/VeoTypes';

export default defineComponent({
  name: 'VeoObjectForm',
  props: {
    value: {
      type: Object,
      default: () => {}
    } as PropOptions<IBaseObject>,
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    objectSchema: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoObjectSchema>,
    disableHistory: {
      type: Boolean,
      default: false
    },
    disableSubTypeSelect: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    },
    preselectedSubType: {
      type: String,
      default: undefined
    },
    valid: {
      type: Boolean,
      default: true
    },
    scrollWrapperId: {
      type: String,
      default: 'scroll-wrapper'
    },
    /**
     * If set to true, objects can't be created from within the custom link dropdown
     */
    objectCreationDisabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const { $api } = useContext();
    const { personReactiveFormActions } = useVeoReactiveFormActions();

    // Formschema/display stuff
    const translations: Ref<{ [key: string]: IVeoTranslationCollection } | undefined> = ref(undefined);
    const formSchemas: Ref<IVeoFormSchemaMeta[]> = ref([]);
    const currentFormSchema: Ref<undefined | IVeoFormSchema> = ref(undefined);

    const { $fetch } = useFetch(async () => {
      // Only fetch once, as translations changing while the user uses this component is highly unlikely
      if (!translations.value) {
        translations.value = (await $api.translation.fetch(['de', 'en'])).lang;
      }
      // Only fetch formschema overview once, as formschemas getting added/changed while the user uses this component is highly unlikely
      if (formSchemas.value.length === 0) {
        formSchemas.value = await $api.form.fetchAll(props.domainId);

        if (props.preselectedSubType) {
          const formSchemaId = getFormschemaIdBySubType(props.preselectedSubType);

          if (formSchemaId) {
            selectedDisplayOption.value = formSchemaId;
          }
        }
      }
      if (selectedDisplayOption.value !== 'objectschema') {
        currentFormSchema.value = await $api.form.fetch(props.domainId, selectedDisplayOption.value);
      } else {
        currentFormSchema.value = undefined;
      }

      const subType = formSchemas.value.find((formschema) => formschema.id === selectedDisplayOption.value)?.subType;

      // Set sub type and status if subType was not set and the user views the object with a subtype
      if (subType && props.domainId && !objectData.value?.domains?.[props.domainId]?.subType) {
        const newDomainObject = {
          domains: {
            [props.domainId]: {
              subType,
              status: 'NEW'
            }
          }
        };
        objectData.value = merge(objectData.value, newDomainObject);
      }
    });

    const selectedDisplayOption = ref('objectschema');
    const displayOptions: ComputedRef<{ text: string; value: string | undefined }[]> = computed(() => {
      const currentSubType = props.value?.domains?.[props.domainId]?.subType;
      const availableFormSchemas: { text: string; value: string | undefined }[] = formSchemas.value
        .filter((formSchema) => formSchema.modelType === props.objectSchema?.title && (!currentSubType || currentSubType === formSchema.subType))
        .map((formSchema) => ({
          text: formSchema.name[locale.value] || formSchema.subType,
          value: formSchema.id
        }));
      availableFormSchemas.unshift({ text: upperFirst(t('objectView').toString()), value: 'objectschema' });
      return availableFormSchemas;
    });

    watch(selectedDisplayOption, () => {
      $fetch();
    });

    const formSchemaHasGroups = computed(() => {
      return currentFormSchema.value?.content.elements?.some((element: any) => (element.type === 'Layout' || element.type === 'Group') && element.options.label);
    });

    function getFormschemaIdBySubType(subType: string) {
      const formSchemaId = formSchemas.value.find((formschema) => formschema.subType === subType)?.id;
      if (formSchemaId) {
        return formSchemaId;
      }
    }

    watch(
      () => props.preselectedSubType,
      (newValue) => {
        const formSchemaId = getFormschemaIdBySubType(newValue);
        if (newValue && formSchemaId) {
          selectedDisplayOption.value = formSchemaId;
        } else {
          selectedDisplayOption.value = 'objectschema';
        }
      }
    );

    // Form stuff
    const objectData = computed({
      get() {
        return props.value as IBaseObject;
      },
      set(newValue: IBaseObject) {
        emit('input', newValue);
      }
    });
    const formErrors: Ref<any[]> = ref([]);

    watch(
      () => formErrors.value,
      () => {
        emit('update:valid', formErrors.value.length === 0);
      }
    );

    const reactiveFormActions: ComputedRef<IVeoReactiveFormAction[]> = computed(() => {
      return props.objectSchema?.title === 'person' ? personReactiveFormActions() : [];
    });

    // Messages stuff
    const messages = computed(() => ({
      errors: formErrors.value.map((entry) => ({ code: entry.pointer, message: entry.message })),
      warnings: []
    }));

    return {
      currentFormSchema,
      displayOptions,
      formErrors,
      formSchemaHasGroups,
      locale,
      messages,
      objectData,
      reactiveFormActions,
      selectedDisplayOption,
      translations,

      mdiFormatListBulleted,
      mdiHistory,
      mdiInformationOutline,
      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "display": "view as",
    "history": "history",
    "messages": "messages",
    "objects": "objects",
    "objectView": "object view",
    "tableOfContents": "contents"
  },
  "de": {
    "display": "Ansicht",
    "history": "Verlauf",
    "messages": "Meldungen",
    "objects": "Objekte",
    "objectView": "Objektansicht",
    "tableOfContents": "Inhalt"
  }
}
</i18n>
