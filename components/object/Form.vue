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
  <LayoutPageWrapper
    unresponsive-page-widths
    :page-widths="[{ width: '100%', minWidth: 0 }, 'auto']"
  >
    <template #default>
      <BasePage
        :id="scrollWrapperId"
        data-component-name="object-form-form"
        sticky-footer
        no-padding
      >
        <template #default>
          <slot name="prepend-form" />
          <BaseCard>
            <v-card-text>
              <DynamicFormEntrypoint
                v-if="!dataIsLoading"
                v-model="objectData"
                :disabled="disabled"
                :object-schema="objectSchema"
                :form-schema="currentFormSchema && currentFormSchema.content"
                :meta-data="objectMetaData"
                :additional-context="localAdditionalContext"
                :reactive-form-actions="reactiveFormActions"
                :object-creation-disabled="objectCreationDisabled"
                :translations="mergedTranslations"
                @update:messages="formErrors = $event"
              />
              <ObjectFormSkeletonLoader v-else />
            </v-card-text>
          </BaseCard>
        </template>
        <template #footer>
          <slot name="append-form-outer" />
        </template>
      </BasePage>
      <BasePage
        content-class="fill-height"
        height="100%"
        no-padding
        data-component-name="object-form-sidebar"
      >
        <template #default>
          <div class="d-flex flex-row fill-height pb-13 ml-2 align-start">
            <BaseCard
              v-show="selectedSideContainer !== undefined"
              class="overflow-y-auto"
              style="max-height: 100%; width: 300px"
            >
              <div v-if="selectedSideContainer === SIDE_CONTAINERS.VIEW">
                <h2 class="text-h2 px-4 pt-1">
                  {{ t('display') }}
                </h2>
                <v-card-text>
                  <v-select
                    v-model="selectedDisplayOption"
                    class="mt-n2"
                    :label="upperFirst(t('viewAs').toString())"
                    hide-details
                    variant="underlined"
                    :items="displayOptions"
                  />
                </v-card-text>
              </div>
              <LayoutFormNavigation
                v-else-if="selectedSideContainer === SIDE_CONTAINERS.TABLE_OF_CONTENTS && currentFormSchema"
                :form-schema="currentFormSchema && currentFormSchema.content"
                :custom-translation="currentFormSchema && currentFormSchema.translation && currentFormSchema.translation[locale]"
                :scroll-wrapper-id="scrollWrapperId"
              />
              <ObjectHistory
                v-else-if="objectData && selectedSideContainer === SIDE_CONTAINERS.HISTORY"
                class="fill-height overflow-y-auto"
                :object="originalObject || objectData"
                :loading="loading"
                :object-schema="objectSchema"
                @show-revision="onShowRevision"
              />
              <ObjectMessagesTab
                v-else-if="selectedSideContainer === SIDE_CONTAINERS.MESSAGES"
                :messages="messages"
              />
            </BaseCard>
            <v-btn-toggle
              v-model="selectedSideContainer"
              :class="$style['object-side-container-select']"
              color="primary"
              variant="plain"
            >
              <v-tooltip location="start">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    data-component-name="object-form-view-tab"
                    :icon="mdiEyeOutline"
                    class="my-1 py-1"
                    :value="SIDE_CONTAINERS.VIEW"
                  />
                </template>
                <template #default>
                  {{ t('display') }}
                </template>
              </v-tooltip>
              <v-tooltip location="start">
                <template #activator="{ props }">
                  <div v-bind="props">
                    <v-btn
                      :disabled="!currentFormSchema"
                      data-component-name="object-form-toc-tab"
                      :icon="mdiTableOfContents"
                      class="my-1 py-1"
                      :value="SIDE_CONTAINERS.TABLE_OF_CONTENTS"
                    />
                  </div>
                </template>
                <template #default>
                  {{ t('tableOfContents') }}
                </template>
              </v-tooltip>
              <v-tooltip location="start">
                <template #activator="{ props }">
                  <div v-bind="props">
                    <v-btn
                      data-component-name="object-form-history-tab"
                      :disabled="disableHistory"
                      :icon="mdiHistory"
                      class="my-1 py-1"
                      :value="SIDE_CONTAINERS.HISTORY"
                    />
                  </div>
                </template>
                <template #default>
                  {{ t('history') }}
                </template>
              </v-tooltip>
              <v-tooltip location="start">
                <template #activator="{ props }">
                  <div>
                    <v-badge
                      :content="messages.errors.length + messages.warnings.length + messages.information.length"
                      :model-value="messages.errors.length + messages.warnings.length + messages.information.length > 0"
                      :color="messages.errors.length ? 'error' : messages.warnings.length ? 'warning' : 'info'"
                    >
                      <v-btn
                        v-bind="props"
                        data-component-name="object-form-messages-tab"
                        class="my-1 py-1"
                        :icon="mdiInformationOutline"
                        :value="SIDE_CONTAINERS.MESSAGES"
                      />
                    </v-badge>
                  </div>
                </template>
                <template #default>
                  {{ t('messages') }}
                </template>
              </v-tooltip>
            </v-btn-toggle>
          </div>
        </template>
      </BasePage>
    </template>
  </LayoutPageWrapper>
</template>

<script lang="ts">
import { PropType } from 'vue';

import { upperFirst, merge, debounce } from 'lodash';
import { mdiEyeOutline, mdiHistory, mdiInformationOutline, mdiTableOfContents } from '@mdi/js';

import { IVeoFormsAdditionalContext, IVeoFormsReactiveFormActions } from '~/components/dynamic-form/types';
import { getRiskAdditionalContext, getStatusAdditionalContext } from '~/components/dynamic-form/additionalContext';
import { useVeoReactiveFormActions } from '~/composables/VeoReactiveFormActions';
import { IVeoEntity, IVeoInspectionResult, IVeoObjectHistoryEntry } from '~/types/VeoTypes';
import { VeoSchemaValidatorMessage } from '~/lib/ObjectSchemaValidator';

import formQueryDefinitions, { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import translationQueryDefinitions, { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';

import { useQuery, useQuerySync } from '~~/composables/api/utils/query';

enum SIDE_CONTAINERS {
  HISTORY,
  MESSAGES,
  TABLE_OF_CONTENTS,
  VIEW
}

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    objectType: {
      type: String,
      required: true
    },
    objectMetaData: {
      type: Object,
      default: () => ({})
    },
    disableHistory: {
      type: Boolean,
      default: false
    },
    additionalContext: {
      type: Object as PropType<IVeoFormsAdditionalContext>,
      default: () => ({})
    },
    domainId: {
      type: String,
      required: true
    },
    valid: {
      type: Boolean,
      default: true
    },
    scrollWrapperId: {
      type: String,
      default: 'scroll-wrapper'
    },
    originalObject: {
      type: Object as PropType<IVeoEntity | undefined>,
      default: undefined
    },
    /**
     * If set to true, objects can't be created from within the custom link dropdown
     */
    objectCreationDisabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:model-value', 'update:valid', 'create-dpia', 'link-dpia', 'update:object-meta-data', 'show-revision'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const { t: $t } = useI18n({ useScope: 'global' });
    const { personReactiveFormActions } = useVeoReactiveFormActions();

    // Object stuff
    const objectData = computed({
      get() {
        return props.modelValue as Record<string, any>;
      },
      set(newValue: Record<string, any>) {
        emit('update:model-value', newValue);
      }
    });
    const subType = computed(() => objectData.value?.domains?.[props.domainId]?.subType);

    // Formschema/display stuff
    // Fetching object schema
    const fetchSchemaQueryParameters = computed(() => ({ type: props.objectType, domainIds: [props.domainId] }));
    const fetchSchemaQueryEnabled = computed(() => !!props.objectType && !!props.domainId);
    const { data: objectSchema, isFetching: objectSchemaIsFetching } = useQuery(schemaQueryDefinitions.queries.fetchSchema, fetchSchemaQueryParameters, {
      enabled: fetchSchemaQueryEnabled
    });

    const translationQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations, isFetching: translationsAreFetching } = useQuery(translationQueryDefinitions.queries.fetch, translationQueryParameters);
    const mergedTranslations = computed<IVeoTranslations['lang']>(() => merge({}, translations.value?.lang || {}, currentFormSchema.value?.translation || {}));

    const fetchDomainQueryParameters = computed(() => ({ id: props.domainId as string }));
    const fetchDomainQueryEnabled = computed(() => !!props.domainId);
    const { data: domain, isFetching: domainIsFetching } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters, {
      enabled: fetchDomainQueryEnabled
    });

    const localAdditionalContext = computed<IVeoFormsAdditionalContext>(() => ({
      ...props.additionalContext,
      ...(objectSchema.value && domain.value ? getRiskAdditionalContext(objectSchema.value.title, domain.value, locale.value) : {}),
      ...(props.modelValue && objectSchema.value && translations.value
        ? getStatusAdditionalContext(props.modelValue, objectSchema.value, mergedTranslations.value[locale.value], props.domainId)
        : {})
    }));

    const selectedDisplayOption = ref('objectschema');

    const formsQueryParameters = computed(() => ({ domainId: props.domainId as string}));
    const formsQueryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas, isFetching: formSchemasAreFetching } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, { enabled: formsQueryEnabled, placeholderData: [] });

    const formQueryParameters = computed(() => ({ domainId: props.domainId, id: selectedDisplayOption.value as string}));
    const formQueryEnabled = computed(() => selectedDisplayOption.value !== 'objectschema');
    const { data: formSchema, isFetching: formSchemaIsFetching } = useQuery(formQueryDefinitions.queries.fetchForm, formQueryParameters, { enabled: formQueryEnabled });
    const currentFormSchema = computed(() => (selectedDisplayOption.value === 'objectschema' || formSchemaIsFetching.value ? undefined : formSchema.value));

    function getFormschemaIdBySubType(subType: string) {
      const formSchemaId = (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.subType === subType)?.id;
      if (formSchemaId) {
        return formSchemaId;
      }
    }
    function getSubTypeByFormSchemaId(id: string) {
      const formSchemaId = (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.id === id)?.subType;
      if (formSchemaId) {
        return formSchemaId;
      }
    }

    const setDisplayOptionBasedOnSubtype = () => {
      if(!subType.value) {
        return;
      }
      const formSchemaId = getFormschemaIdBySubType(subType.value);
      if (formSchemaId) {
        selectedDisplayOption.value = formSchemaId;
      } else {
        selectedDisplayOption.value = 'objectschema';
      }
    };

    watch(
      () => formSchemas.value,
      (newValue) => {
        if (newValue && subType.value) {
          setDisplayOptionBasedOnSubtype();
        }
      },
      { deep: true, immediate: true }
    );
    watch(() => subType.value, (newValue) => {
      if(newValue) {
        setDisplayOptionBasedOnSubtype();
      }
    });

    watch(() => selectedDisplayOption.value, (newValue) => {
      if(!!newValue && objectData.value.domains && !objectData.value?.domains?.[props.domainId]?.subType) {
        objectData.value.domains[props.domainId] = {
          subType: getSubTypeByFormSchemaId(newValue),
          status: 'NEW'
        };
      }
    });

    const displayOptions = computed<{ title: string; value: string | undefined }[]>(() => {
      const currentSubType = objectData.value?.domains?.[props.domainId]?.subType;
      const availableFormSchemas: { title: string; value: string | undefined }[] = (formSchemas.value as IVeoFormSchemaMeta[])
        .filter((formSchema) => formSchema.modelType === objectSchema.value?.title && (!currentSubType || currentSubType === formSchema.subType))
        .map((formSchema) => ({
          title: formSchema.name[locale.value] || formSchema.subType,
          value: formSchema.id
        }));
      availableFormSchemas.unshift({ title: upperFirst(t('objectView').toString()), value: 'objectschema' });
      return availableFormSchemas;
    });

    const formSchemaHasGroups = computed(() => {
      return currentFormSchema.value?.content.elements?.some((element: any) => (element.type === 'Layout' || element.type === 'Group') && element.options.label);
    });

    // Form stuff
    const formErrors = ref<Map<string, string[]>>(new Map());

    watch(
      () => formErrors.value,
      () => {
        emit('update:valid', !formErrors.value.size);
      }
    );

    const reactiveFormActions = computed<IVeoFormsReactiveFormActions>(() => {
      return objectSchema.value?.title === 'person' ? personReactiveFormActions() : {};
    });

    // side menu stuff
    const selectedSideContainer = ref<undefined | SIDE_CONTAINERS>(undefined);

    // Messages stuff
    const messages = computed(() => ({
      errors: Array.from(formErrors.value).map(([objectSchemaPointer, messages]) => ({ code: objectSchemaPointer, message: messages[0], params: { type: 'error' } })),
      warnings: (props.objectMetaData?.inspectionFindings || [])
        .filter((warning: IVeoInspectionResult) => warning.severity === 'WARNING')
        .map((warning: IVeoInspectionResult) => formatWarning(warning)),
      information: objectInformation.value
    }));

    const objectInformation = computed<VeoSchemaValidatorMessage[]>(() => {
      const information: VeoSchemaValidatorMessage[] = [];
      const decisionRules = domain.value?.decisions?.piaMandatory?.rules || [];

      if (objectData.value?.domains?.[props.domainId]?.subType === 'PRO_DataProcessing') {
        const decisionName = domain.value?.decisions?.piaMandatory?.name[locale.value] || Object.values(domain.value?.decisions?.piaMandatory?.name || {})[0];
        const decisiveRuleDescription =
          decisionRules[props.objectMetaData?.decisionResults?.piaMandatory?.decisiveRule]?.description[locale.value] ||
          Object.values(decisionRules[props.objectMetaData?.decisionResults?.piaMandatory?.decisiveRule]?.description || {})[0];
        if (props.objectMetaData?.decisionResults?.piaMandatory?.value !== undefined) {
          if (props.objectMetaData.decisionResults.piaMandatory.value) {
            information.push({
              code: 'I_PIA_MANDATORY',
              message: `${decisionName}: ${$t('global.button.yes').toString()}` + (decisiveRuleDescription ? ` (${decisiveRuleDescription})` : ''),
              params: {
                type: 'info'
              }
            });
          } else {
            information.push({
              code: 'I_PIA_NOT_MANDATORY',
              message: `${decisionName}: ${$t('global.button.no').toString()}` + (decisiveRuleDescription ? ` (${decisiveRuleDescription})` : ''),
              params: {
                type: 'success'
              }
            });
          }
        } else {
          information.push({
            code: 'I_PIA_MANDATORY_UNKNOWN',
            message: `${decisionName}: ${upperFirst(t('unknown').toString())}` + (decisiveRuleDescription ? ` (${decisiveRuleDescription})` : ''),
            params: {
              type: 'info'
            }
          });
        }
      }

      return information;
    });

    const formatWarning = (warning: IVeoInspectionResult) => {
      let actions: VeoSchemaValidatorMessage['actions'] = [];

      for (const suggestion of warning.suggestions) {
        if (suggestion.type === 'addPart') {
          actions = [
            ...actions,
            {
              title: t('createDPIA').toString(),
              callback: () => {
                emit('create-dpia');
              }
            },
            {
              title: t('linkDPIA').toString(),
              callback: () => {
                emit('link-dpia');
              }
            }
          ];
        }
      }

      return {
        message: warning.description[locale.value] || Object.values(warning.description)[0],
        actions,
        params: {
          type: 'warning'
        }
      };
    };

    const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
    const fetchDecisions = async () => {
      const toReturn: any = { ...props.objectMetaData, decisionResults: {}, inspectionFindings: [] };

      // Fetch updated decision results and merge them with the current values
      if (objectData.value?.domains?.[props.domainId] && endpoints.value?.[objectData.value.type]) {
        for (const key in props.objectMetaData?.decisionResults || {}) {
          const result = await useQuerySync(objectQueryDefinitions.queries.fetchWipDecisionEvaluation, {endpoint: endpoints.value[objectData.value.type], object: objectData.value as any, domain: props.domainId, decision: key });
          toReturn.inspectionFindings.push(...result.inspectionFindings);
          toReturn.decisionResults[key] = result.decisionResults.piaMandatory;
        }
        emit('update:object-meta-data', toReturn);
      }
    };

    const debouncedFetchDecisions = debounce(fetchDecisions, 1000);

    watch(() => objectData.value, debouncedFetchDecisions, { deep: true });

    const dataIsLoading = computed<boolean>(
      () => objectSchemaIsFetching.value || props.loading || formSchemasAreFetching.value || formSchemaIsFetching.value || domainIsFetching.value || translationsAreFetching.value
    );

    const onShowRevision = (revision: IVeoObjectHistoryEntry, isRevision: boolean) => {
      emit('show-revision', revision, isRevision);
    };

    return {
      localAdditionalContext,
      currentFormSchema,
      dataIsLoading,
      displayOptions,
      formErrors,
      formSchemaHasGroups,
      locale,
      messages,
      mergedTranslations,
      objectData,
      objectSchema,
      onShowRevision,
      reactiveFormActions,
      selectedDisplayOption,
      selectedSideContainer,
      subType,

      mdiEyeOutline,
      mdiHistory,
      mdiInformationOutline,
      mdiTableOfContents,
      upperFirst,
      t,
      SIDE_CONTAINERS
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createDPIA": "create DPIA",
    "display": "view as",
    "history": "history",
    "linkDPIA": "link DPIA",
    "messages": "messages",
    "objects": "objects",
    "objectView": "object view",
    "tableOfContents": "contents",
    "unknown": "unknown",
    "viewAs": "view as"
  },
  "de": {
    "createDPIA": "DSFA erstellen",
    "display": "Ansicht",
    "history": "Verlauf",
    "linkDPIA": "DSFA auswählen",
    "messages": "Meldungen",
    "objects": "Objekte",
    "objectView": "Objektansicht",
    "tableOfContents": "Inhalt",
    "unknown": "unbestimmt",
    "viewAs": "darstellen als"
  }
}
</i18n>

<style lang="scss" module>
.object-side-container-select {
  flex-direction: column;
  height: auto !important;
  width: 60px;
}
</style>
