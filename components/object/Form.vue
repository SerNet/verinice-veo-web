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
              v-if="selectedSideBarAction"
              class="overflow-y-auto"
              style="max-height: 100%; width: 300px"
            >
              <component
                :is="sideBarActions[selectedSideBarAction].component"
                v-bind="sideBarActions[selectedSideBarAction].props"
              />
            </BaseCard>
            <v-btn-toggle
              v-model="selectedSideBarAction"
              :class="$style['object-side-container-select']"
              color="primary"
              variant="plain"
            >
              <ObjectSideBarAction
                v-for="(action, actionName) in sideBarActions"
                v-bind="action"
                :key="actionName"
                :value="actionName"
              >
                <template
                  v-if="actionName === 'messages'"
                  #default="{ props: actionProps, activatorProps }"
                >
                  <div>
                    <v-badge
                      :content="messages.errors.length + messages.warnings.length + messages.information.length"
                      :model-value="messages.errors.length + messages.warnings.length + messages.information.length > 0"
                      :color="messages.errors.length ? 'error' : messages.warnings.length ? 'warning' : 'info'"
                    >
                      <v-btn
                        v-bind="activatorProps"
                        :data-component-name="actionProps.dataComponentName"
                        class="my-1 py-1"
                        :disabled="actionProps.disabled"
                        :icon="actionProps.icon"
                        :value="actionProps.value"
                      />
                    </v-badge>
                  </div>
                </template>
              </ObjectSideBarAction>
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
import { getRiskAdditionalContext, getStatusAdditionalContext, getSubTypeTranslation } from '~/components/dynamic-form/additionalContext';
import { useVeoReactiveFormActions } from '~/composables/VeoReactiveFormActions';
import { IVeoEntity, IVeoInspectionResult, IVeoObjectHistoryEntry } from '~/types/VeoTypes';
import { VeoSchemaValidatorMessage } from '~/lib/ObjectSchemaValidator';

import formQueryDefinitions, { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import translationQueryDefinitions, { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';

import ObjectDisplayOptions from '~~/components/object/DisplayOptions.vue';
import LayoutFormNavigation from '~~/components/layout/FormNavigation.vue';
import ObjectHistory from '~~/components/object/History.vue';
import Messages from '~~/components/object/MessagesTab.vue';

import { useQuery, useQueries } from '~~/composables/api/utils/query';
import { SideBarAction } from './SideBarAction.vue';

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
        : {}),
      ...(objectSchema.value && props.modelValue ? getSubTypeTranslation(props.modelValue, objectSchema.value, props.domainId, locale.value, formSchemas.value || []):{})
    }));

    // Stuff that manages which form schema gets used to display the object
    const formsQueryParameters = computed(() => ({ domainId: props.domainId as string}));
    const formsQueryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas, isFetching: formSchemasAreFetching } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, { enabled: formsQueryEnabled, placeholderData: [] });

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

    // Stuff that handles which formschema the object gets displayed with
    const displayOption = ref<string>('objectschema');
    const formQueryParameters = computed(() => ({ domainId: props.domainId, id: displayOption.value as string }));
    const formQueryEnabled = computed(() => displayOption.value !== 'objectschema');
    const { data: formSchema, isFetching: formSchemaIsFetching } = useQuery(formQueryDefinitions.queries.fetchForm, formQueryParameters, { enabled: formQueryEnabled });
    const currentFormSchema = computed(() => (displayOption.value === 'objectschema' || formSchemaIsFetching.value ? undefined : formSchema.value));

    const getFormschemaIdBySubType = (subType: string) => {
      const formSchemaId = (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.subType === subType)?.id;
      if (formSchemaId) {
        return formSchemaId;
      }
    };
    
    const getSubTypeByFormSchemaId = (id: string) => {
      const formSchemaId = (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.id === id)?.subType;
      if (formSchemaId) {
        return formSchemaId;
      }
    };

    const setDisplayOptionBasedOnSubtype = () => {
      if(!subType.value) {
        return;
      }
      const formSchemaId = getFormschemaIdBySubType(subType.value);
      if (formSchemaId) {
        displayOption.value = formSchemaId;
      } else {
        displayOption.value = 'objectschema';
      }
    };

    // If the available form schemas change check if a subtype is set and get a formschema for that sub type
    watch(() => formSchemas.value, setDisplayOptionBasedOnSubtype, { deep: true, immediate: true });
    // If the subtype changes, check if a formschema for the subtype exists and set it's id
    watch(() => subType.value, setDisplayOptionBasedOnSubtype, { deep: true, immediate: true });

    // If no subtype is set but the users switches to a formschema, automatically set that schemas subtype
    watch(() => displayOption.value, (newValue) => {
      if(!!newValue && objectData.value.domains && !objectData.value?.domains?.[props.domainId]?.subType) {
        objectData.value.domains[props.domainId] = {
          subType: getSubTypeByFormSchemaId(newValue),
          status: 'NEW'
        };
      }
    });

    type SIDE_BAR_ACTIONS = 'display' | 'tableOfContents' | 'history' | 'messages'
    const selectedSideBarAction = ref<SIDE_BAR_ACTIONS | undefined>(undefined);
    const sideBarActions = computed<Record<SIDE_BAR_ACTIONS, SideBarAction>>(() =>
      ({
        display: {
          icon: mdiEyeOutline,
          name: t('display'),
          dataComponentName: 'object-form-view-tab',
          component: ObjectDisplayOptions,
          props: {
            displayOption: displayOption.value,
            domainId: props.domainId,
            formSchemas: formSchemas.value,
            objectSchema: objectSchema.value,
            objectData: objectData.value,
            'onUpdate:displayOption': (newDisplayOption: string) => displayOption.value = newDisplayOption
          }
        },
        tableOfContents: {
          icon: mdiTableOfContents,
          name: t('tableOfContents'),
          dataComponentName: 'object-form-toc-tab',
          disabled: !currentFormSchema.value,
          component: LayoutFormNavigation,
          props: {
            formSchema: currentFormSchema.value?.content,
            customTranslation: currentFormSchema.value?.translation?.[locale.value],
            scrollWrapperId: props.scrollWrapperId
          }
        },
        history: {
          icon: mdiHistory,
          name: t('history'),
          dataComponentName: 'object-form-history-tab',
          component: ObjectHistory,
          disabled: props.disableHistory,
          props: {
            objectType: props.originalObject?.type,
            objectId: props.originalObject?.id,
            objectSchema: objectSchema?.value,
            onShowRevision
          }
        },
        messages: {
          icon: mdiInformationOutline,
          name: t('messages'),
          dataComponentName: 'object-form-messages-tab',
          component: Messages,
          props: {
            messages: messages.value
          }
        }
      })
    );

    const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
    const inspectionData = ref<any>(objectData.value);
    const fetchDecisionsQueryParameters = computed(() => {
      return Object.keys(props.modelValue.domains?.[props.domainId]?.decisionResults || {}).map((key) => ({
        decision: key,
        domain: props.domainId,
        endpoint: endpoints.value?.[inspectionData.value.type] as string,
        object: inspectionData.value
      }));
    });
    const fetchDecisionsQueryEnabled = computed(() => !!objectData.value?.domains?.[props.domainId] && !!endpoints.value?.[objectData.value.type] && !formErrors.value.size);
    const decisionResults = useQueries(
      objectQueryDefinitions.queries.fetchWipDecisionEvaluation,
      fetchDecisionsQueryParameters,
      {
        enabled: fetchDecisionsQueryEnabled
      }
    );
    const setInspectionData = (newData: any) => {
      inspectionData.value = newData;
    };
    const debouncedSetInspectionData = debounce(setInspectionData, 1000);
    watch(() => objectData.value, debouncedSetInspectionData, { deep: true });
    watch(() => decisionResults, (newValue) => {
      const toReturn: any = { ...props.objectMetaData, decisionResults: {}, inspectionFindings: [] };
      for(const result of newValue) {
        toReturn.decisionResults = merge(toReturn.decisionResults, result.data?.decisionResults);
        toReturn.inspectionFindings = toReturn.inspectionFindings.concat(result.data?.inspectionFindings || []);
      }
      emit('update:object-meta-data', toReturn);
    }, { deep: true });


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
      displayOption,
      formErrors,
      locale,
      messages,
      mergedTranslations,
      objectData,
      objectSchema,
      onShowRevision,
      reactiveFormActions,
      selectedSideBarAction,
      sideBarActions,
      subType,

      mdiEyeOutline,
      mdiHistory,
      mdiInformationOutline,
      mdiTableOfContents,
      upperFirst,
      t
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
    "tableOfContents": "contents",
    "unknown": "unknown"
  },
  "de": {
    "createDPIA": "DSFA erstellen",
    "display": "Ansicht",
    "history": "Verlauf",
    "linkDPIA": "DSFA auswählen",
    "messages": "Meldungen",
    "objects": "Objekte",
    "tableOfContents": "Inhalt",
    "unknown": "unbestimmt"
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
