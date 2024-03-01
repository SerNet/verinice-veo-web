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
  <LayoutPageWrapper unresponsive-page-widths :page-widths="[{ width: '100%', minWidth: 0 }, 'auto']">
    <template #default>
      <BasePage :id="scrollWrapperId" data-component-name="object-form-form" sticky-footer no-padding>
        <template #default>
          <slot name="prepend-form" />
          <BaseCard>
            <v-card-text>
              <DynamicFormEntrypoint
                v-if="!dataIsLoading && objectSchema"
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
      <BasePage content-class="fill-height" height="100%" no-padding data-component-name="object-form-sidebar">
        <template #default>
          <div class="d-flex flex-row fill-height pb-13 ml-2 align-start">
            <BaseCard v-if="selectedSideBarAction" class="overflow-y-auto" style="max-height: 100%; width: 300px">
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
                <template v-if="actionName === 'messages'" #default="{ props: actionProps, activatorProps }">
                  <div>
                    <v-badge :content="messages.length" :model-value="!!messages.length" :color="messagesBadgeColor">
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

import { upperFirst, merge, debounce, isEmpty } from 'lodash';
import { mdiEyeOutline, mdiHistory, mdiInformationOutline, mdiTableOfContents } from '@mdi/js';

import { IVeoFormsAdditionalContext, IVeoFormsReactiveFormActions } from '~/components/dynamic-form/types';
import {
  getRiskAdditionalContext,
  getStatusAdditionalContext,
  getSubTypeTranslation
} from '~/components/dynamic-form/additionalContext';
import { useVeoReactiveFormActions } from '~/composables/VeoReactiveFormActions';
import { IVeoDecisionResults, IVeoEntity, IVeoInspectionResult, IVeoObjectHistoryEntry } from '~/types/VeoTypes';

import formQueryDefinitions, { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import translationQueryDefinitions, { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';

import ObjectDisplayOptions from '~/components/object/DisplayOptions.vue';
import LayoutFormNavigation from '~/components/layout/FormNavigation.vue';
import ObjectHistory from '~/components/object/History.vue';
import ObjectCreateDialog from '~/components/object/CreateDialog.vue';
import ObjectLinkDialog from '~/components/object/LinkDialog.vue';
import Messages, { Message } from '~/components/object/messages/Messages.vue';

import { useQuery } from '~/composables/api/utils/query';
import { SideBarAction } from './SideBarAction.vue';
import { INestedMenuEntries } from '../util/NestedMenu.vue';

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
    const subType = computed(() => objectData.value?.subType);

    const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
    const objectTypePlural = computed(() => endpoints.value?.[props.objectType]);

    // Formschema/display stuff
    // Fetching object schema
    const fetchSchemaQueryParameters = computed(() => ({
      type: objectTypePlural.value as string,
      domainId: props.domainId
    }));
    const fetchSchemaQueryEnabled = computed(() => !!objectTypePlural.value && !!props.domainId);
    const { data: objectSchema, isFetching: objectSchemaIsFetching } = useQuery(
      schemaQueryDefinitions.queries.fetchSchema,
      fetchSchemaQueryParameters,
      {
        enabled: fetchSchemaQueryEnabled
      }
    );

    const translationQueryParameters = computed(() => ({
      languages: [locale.value],
      domain: props.domainId
    }));
    const { data: translations, isFetching: translationsAreFetching } = useQuery(
      translationQueryDefinitions.queries.fetch,
      translationQueryParameters
    );
    const mergedTranslations = computed<IVeoTranslations['lang']>(() =>
      merge({}, translations.value?.lang || {}, currentFormSchema.value?.translation || {})
    );

    const fetchDomainQueryParameters = computed(() => ({
      id: props.domainId as string
    }));
    const fetchDomainQueryEnabled = computed(() => !!props.domainId);
    const { data: domain, isFetching: domainIsFetching } = useQuery(
      domainQueryDefinitions.queries.fetchDomain,
      fetchDomainQueryParameters,
      {
        enabled: fetchDomainQueryEnabled
      }
    );

    const localAdditionalContext = computed<IVeoFormsAdditionalContext>(() => ({
      ...props.additionalContext,
      ...(objectSchema.value && domain.value ?
        getRiskAdditionalContext(objectSchema.value.title, domain.value, locale.value)
      : {}),
      ...(props.modelValue && objectSchema.value && translations.value ?
        getStatusAdditionalContext(props.modelValue, objectSchema.value, mergedTranslations.value[locale.value])
      : {}),
      ...(objectSchema.value && props.modelValue ?
        getSubTypeTranslation(props.modelValue, objectSchema.value, locale.value, formSchemas.value || [])
      : {})
    }));

    // Stuff that manages which form schema gets used to display the object
    const formsQueryParameters = computed(() => ({
      domainId: props.domainId as string
    }));
    const formsQueryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas, isFetching: formSchemasAreFetching } = useQuery(
      formQueryDefinitions.queries.fetchForms,
      formsQueryParameters,
      { enabled: formsQueryEnabled, placeholderData: [] }
    );

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
    const transformFormErrors = (formErrors: Map<string, string[]>): Message[] =>
      Array.from(formErrors).map(([objectSchemaPointer, text]) => ({
        key: objectSchemaPointer,
        type: 'error',
        text: text[0]
      }));

    const transformDecisionResults = (decisionResults: IVeoDecisionResults | undefined): Message[] =>
      Object.entries(decisionResults || {}).map(([decision, result]) => {
        const decisionInDomain = domain.value?.decisions?.[decision];

        if (!decisionInDomain) {
          return {
            key: `${decision}_unknown`,
            type: 'warning',
            text: `Text for decision ${decision} not found`
          };
        }

        const decisionResultStrings: Record<string, string> = {
          true: $t('global.button.yes'),
          false: $t('global.button.no'),
          undefined: t('unknown')
        };
        // Returns true, false or undefined as string
        const decisionResultAsString = typeof result.value === 'undefined' ? 'undefined' : `${result.value}`;

        const decisionName = decisionInDomain.name[locale.value] || Object.values(decisionInDomain.name || {})[0];
        const decisiveRuleDescription =
          result.decisiveRule !== undefined ?
            decisionInDomain.rules[result.decisiveRule]?.description[locale.value] ||
            Object.values(decisionInDomain.rules[result.decisiveRule]?.description || {})[0]
          : '';

        return {
          key: `${decision}_${decisionResultAsString}`,
          type: result.value === false ? 'success' : 'info',
          text:
            `${decisionName}: ${decisionResultStrings[decisionResultAsString]}` +
            (result.decisiveRule !== undefined ? ` (${decisiveRuleDescription})` : '')
        };
      });

    const transformInspectionFindingSuggestions = (
      suggestions: IVeoInspectionResult['suggestions']
    ): INestedMenuEntries[] =>
      suggestions
        .map((suggestion) => {
          switch (suggestion.type) {
            case 'addPart':
              return [
                {
                  key: `${suggestion.partSubType}_create`,
                  title: t('createDPIA'),
                  component: ObjectCreateDialog,
                  componentProps: {
                    objectType: props.objectType,
                    subType: suggestion.partSubType,
                    domainId: props.domainId
                  }
                },
                {
                  key: `${suggestion.partSubType}_link`,
                  title: t('linkDPIA'),
                  component: ObjectLinkDialog,
                  componentProps: {
                    object: props.originalObject,
                    preselectedFilters: { subType: suggestion?.partSubType }
                  }
                }
              ];
            default:
              return [];
          }
          // [[{ text: Action 1 }, { text: Action 2 }], [...]] => [{ text: Action 1 }, { text: Action 2 }, ...]
        })
        .reduce((previousValue, currentValue) => {
          previousValue.push(...currentValue);
          return previousValue;
        }, []);

    const transformInspectionFindings = (inspectionFindings: IVeoInspectionResult[]) =>
      inspectionFindings.map((finding) => ({
        key: JSON.stringify(finding.suggestions),
        type: finding.severity.toLowerCase(),
        text: finding.description[locale.value] || Object.values(finding.description)[0],
        actions: transformInspectionFindingSuggestions(finding.suggestions)
      }));

    const messages = computed(() => [
      ...transformFormErrors(formErrors.value),
      ...transformDecisionResults(inspectionFindings.value?.decisionResults),
      ...transformInspectionFindings(inspectionFindings.value?.inspectionFindings || [])
    ]);

    const messagesBadgeColor = computed(() =>
      messages.value.some((message) => message.type === 'error') ? 'error'
      : messages.value.some((message) => message.type === 'warning') ? 'warning'
      : 'info'
    );

    // Stuff that handles which formschema the object gets displayed with
    const displayOption = ref<string>('objectschema');
    const formQueryParameters = computed(() => ({
      id: displayOption.value as string
    }));
    const formQueryEnabled = computed(() => displayOption.value !== 'objectschema');
    const { data: formSchema, isFetching: formSchemaIsFetching } = useQuery(
      formQueryDefinitions.queries.fetchForm,
      formQueryParameters,
      { enabled: formQueryEnabled }
    );
    const currentFormSchema = computed(() =>
      displayOption.value === 'objectschema' || formSchemaIsFetching.value ? undefined : formSchema.value
    );

    const getFormschemaIdBySubType = (subType: string) => {
      const formSchemaId = (formSchemas.value as IVeoFormSchemaMeta[]).find(
        (formschema) => formschema.subType === subType
      )?.id;
      if (formSchemaId) {
        return formSchemaId;
      }
    };

    const getSubTypeByFormSchemaId = (id: string) => {
      const formSchemaId = (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.id === id)
        ?.subType;
      if (formSchemaId) {
        return formSchemaId;
      }
    };
    const setDisplayOptionBasedOnSubtype = () => {
      if (!subType.value) {
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
    watch(() => formSchemas.value, setDisplayOptionBasedOnSubtype, {
      deep: true,
      immediate: true
    });
    // If the subtype changes, check if a formschema for the subtype exists and set it's id
    watch(() => subType.value, setDisplayOptionBasedOnSubtype, {
      deep: true,
      immediate: true
    });

    // If no subtype is set but the users switches to a formschema, automatically set that schemas subtype
    watch(
      () => displayOption.value,
      (newValue) => {
        if (!!newValue && !objectData.value?.subType) {
          objectData.value.subType = getSubTypeByFormSchemaId(newValue);
          objectData.value.status = 'NEW';
        }
      }
    );

    type SIDE_BAR_ACTIONS = 'display' | 'tableOfContents' | 'history' | 'messages';
    const selectedSideBarAction = ref<SIDE_BAR_ACTIONS | undefined>(undefined);
    const sideBarActions = computed<Record<SIDE_BAR_ACTIONS, SideBarAction>>(() => ({
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
          'onUpdate:displayOption': (newDisplayOption: string) => (displayOption.value = newDisplayOption)
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
    }));

    const debouncedObjectData = ref<any>(objectData.value);

    const fetchInspectionFindingsQueryParameters = computed(() => ({
      id: debouncedObjectData.value.id,
      object: debouncedObjectData.value,
      domain: props.domainId,
      endpoint: objectTypePlural.value as string,
      status: debouncedObjectData.value.status,
      subType: debouncedObjectData.value.subType
    }));
    const fetchInspectionFindingsQueryEnabled = computed(
      () => !!objectTypePlural.value && !isEmpty(debouncedObjectData.value) && !!debouncedObjectData.value.name
    );
    const { data: inspectionFindings } = useQuery(
      objectQueryDefinitions.queries.fetchWipDecisionEvaluation,
      fetchInspectionFindingsQueryParameters,
      {
        enabled: fetchInspectionFindingsQueryEnabled,
        keepPreviousData: true
      }
    );

    const setDebouncedObjectData = (newData: any) => {
      debouncedObjectData.value = newData;
    };
    const debouncedSetObjectData = debounce(setDebouncedObjectData, 1000);
    watch(() => objectData.value, debouncedSetObjectData, { deep: true });

    const objectMetaData = computed(() => ({
      messages: messages.value,
      objectData: props.modelValue
    }));

    const dataIsLoading = computed<boolean>(
      () =>
        objectSchemaIsFetching.value ||
        props.loading ||
        formSchemasAreFetching.value ||
        formSchemaIsFetching.value ||
        domainIsFetching.value ||
        translationsAreFetching.value
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
      messagesBadgeColor,
      mergedTranslations,
      objectData,
      objectMetaData,
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
