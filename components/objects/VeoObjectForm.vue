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
  <VeoPageWrapper
    unresponsive-page-widths
    :page-widths="[{ width: '100%', minWidth: 0 }, 'auto']"
  >
    <template #default>
      <VeoPage
        :id="scrollWrapperId"
        data-component-name="object-form-form"
        sticky-footer
        no-padding
      >
        <template #default>
          <slot name="prepend-form" />
          <VeoCard>
            <v-card-text>
              <VeoForm
                v-if="!formLoading && objectSchema && !loading"
                v-model="objectData"
                :object-schema="objectSchema"
                :form-schema="currentFormSchema && currentFormSchema.content"
                :meta-data="objectMetaData"
                :additional-context="localAdditionalContext"
                :reactive-form-actions="reactiveFormActions"
                :object-creation-disabled="objectCreationDisabled"
                :translations="mergedTranslations"
                @update:messages="formErrors = $event"
              />
              <VeoObjectFormSkeletonLoader v-else />
            </v-card-text>
          </VeoCard>
        </template>
        <template #footer>
          <slot name="append-form-outer" />
        </template>
      </VeoPage>
      <VeoPage
        content-class="fill-height"
        height="100%"
        no-padding
        data-component-name="object-form-sidebar"
      >
        <template #default>
          <div class="d-flex flex-row fill-height pb-13 ml-2 align-start">
            <VeoCard
              v-show="selectedSideContainer !== undefined"
              class="overflow-y-auto"
              style="max-height: 100%; width: 300px"
            >
              <div v-if="selectedSideContainer === SIDE_CONTAINERS.VIEW">
                <h2 class="text-h2 px-4 pt-1">
                  {{ $t('display').toString() }}
                </h2>
                <v-card-text>
                  <v-select
                    v-model="selectedDisplayOption"
                    class="mt-n2"
                    :label="upperFirst(t('viewAs').toString())"
                    hide-details
                    :items="displayOptions"
                    :data-cy="$utils.prefixCyData($options, 'display-select')"
                  />
                </v-card-text>
              </div>
              <VeoFormNavigation
                v-else-if="selectedSideContainer === SIDE_CONTAINERS.TABLE_OF_CONTENTS && currentFormSchema"
                :form-schema="currentFormSchema && currentFormSchema.content"
                :custom-translation="currentFormSchema && currentFormSchema.translation && currentFormSchema.translation[locale]"
                :scroll-wrapper-id="scrollWrapperId"
              />
              <VeoObjectHistory
                v-else-if="objectData && selectedSideContainer === SIDE_CONTAINERS.HISTORY"
                class="fill-height overflow-y-auto"
                :object="objectData"
                :loading="loading"
                :object-schema="objectSchema"
                v-on="$listeners"
              />
              <VeoObjectMessagesTab
                v-else-if="selectedSideContainer === SIDE_CONTAINERS.MESSAGES"
                :messages="messages"
              />
            </VeoCard>
            <v-btn-toggle
              v-model="selectedSideContainer"
              group
              class="flex-column"
              color="primary"
            >
              <v-tooltip left>
                <template #activator="{ on }">
                  <v-btn
                    v-cy-name="'display-tab'"
                    data-component-name="object-form-view-tab"
                    style="border-radius: 99px"
                    icon
                    :value="SIDE_CONTAINERS.VIEW"
                    v-on="on"
                  >
                    <v-icon v-text="mdiEyeOutline" />
                  </v-btn>
                </template>
                <template #default>
                  {{ t('display') }}
                </template>
              </v-tooltip>
              <v-tooltip left>
                <template #activator="{ on }">
                  <div v-on="on">
                    <v-btn
                      :disabled="!currentFormSchema"
                      data-component-name="object-form-toc-tab"
                      style="border-radius: 99px"
                      icon
                      :value="SIDE_CONTAINERS.TABLE_OF_CONTENTS"
                    >
                      <v-icon v-text="mdiFormatListBulleted" />
                    </v-btn>
                  </div>
                </template>
                <template #default>
                  {{ t('tableOfContents') }}
                </template>
              </v-tooltip>
              <v-tooltip left>
                <template #activator="{ on }">
                  <v-btn
                    style="border-radius: 99px"
                    data-component-name="object-form-history-tab"
                    icon
                    :value="SIDE_CONTAINERS.HISTORY"
                    v-on="on"
                  >
                    <v-icon
                      v-cy-name="'history-tab'"
                      v-text="mdiHistory"
                    />
                  </v-btn>
                </template>
                <template #default>
                  {{ t('history') }}
                </template>
              </v-tooltip>
              <v-tooltip left>
                <template #activator="{ on }">
                  <v-btn
                    style="border-radius: 99px"
                    data-component-name="object-form-messages-tab"
                    icon
                    :value="SIDE_CONTAINERS.MESSAGES"
                    v-on="on"
                  >
                    <v-badge
                      :content="messages.errors.length + messages.warnings.length + messages.information.length"
                      :value="messages.errors.length + messages.warnings.length + messages.information.length > 0"
                      :color="messages.errors.length ? 'error' : messages.warnings.length ? 'warning' : 'info'"
                      overlap
                    >
                      <v-icon v-text="mdiInformationOutline" />
                    </v-badge>
                  </v-btn>
                </template>
                <template #default>
                  {{ t('messages') }}
                </template>
              </v-tooltip>
            </v-btn-toggle>
          </div>
        </template>
      </VeoPage>
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropOptions, PropType, Ref, ref, useContext, useFetch, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst, merge, debounce } from 'lodash';
import { mdiEyeOutline, mdiFormatListBulleted, mdiHistory, mdiInformationOutline } from '@mdi/js';

import { IVeoFormsAdditionalContext, IVeoFormsReactiveFormActions } from '~/components/forms/types';
import { getRiskAdditionalContext, getStatusAdditionalContext } from '~/components/forms/additionalContext';
import { IBaseObject } from '~/lib/utils';
import { useVeoReactiveFormActions } from '~/composables/VeoReactiveFormActions';
import { IVeoDomain, IVeoFormSchema, IVeoFormSchemaMeta, IVeoInspectionResult, IVeoObjectSchema, IVeoTranslationCollection } from '~/types/VeoTypes';
import { VeoSchemaValidatorMessage } from '~/lib/ObjectSchemaValidator';

import VeoForm from '~/components/forms/VeoForm.vue';

enum SIDE_CONTAINERS {
  HISTORY,
  MESSAGES,
  TABLE_OF_CONTENTS,
  VIEW
}

export default defineComponent({
  name: 'VeoObjectForm',
  components: { VeoForm },
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
    objectMetaData: {
      type: Object,
      default: () => {}
    },
    disableHistory: {
      type: Boolean,
      default: false
    },
    additionalContext: {
      type: Object as PropType<IVeoFormsAdditionalContext>,
      default: () => {}
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
    const mergedTranslations = computed(() => merge(translations.value, currentFormSchema.value?.translation || {}));
    const formSchemas: Ref<IVeoFormSchemaMeta[]> = ref([]);
    const currentFormSchema: Ref<undefined | IVeoFormSchema> = ref(undefined);

    const domain = ref<IVeoDomain | undefined>();
    const { fetch: fetchDomain } = useFetch(async () => {
      domain.value = await $api.domain.fetch(props.domainId);
      getAdditionalContext();
    });
    watch(() => props.domainId, fetchDomain);

    const localAdditionalContext = ref<IVeoFormsAdditionalContext>({});

    const getAdditionalContext = () => {
      localAdditionalContext.value = {
        ...props.additionalContext,
        ...(props.objectSchema && domain.value ? getRiskAdditionalContext(props.objectSchema.title, domain.value) : {}),
        ...(props.value && props.objectSchema && translations.value
          ? getStatusAdditionalContext(props.value, props.objectSchema, translations.value[locale.value], props.domainId)
          : {})
      };
    };

    watch(() => props.objectSchema, getAdditionalContext, { deep: true });
    watch(() => props.additionalContext, getAdditionalContext, { deep: true });

    const {
      fetch,
      fetchState: { pending: formLoading }
    } = useFetch(async () => {
      fetchDecisions();

      // Only fetch once, as translations changing while the user uses this component is highly unlikely
      if (!translations.value) {
        translations.value = (await $api.translation.fetch(['de', 'en'])).lang;
      }
      // Only fetch formschema overview once, as formschemas getting added/changed while the user uses this component is highly unlikely
      if (formSchemas.value.length === 0) {
        formSchemas.value = await $api.form.fetchAll(props.domainId);
      }

      if (props.preselectedSubType) {
        const formSchemaId = getFormschemaIdBySubType(props.preselectedSubType);

        if (formSchemaId) {
          selectedDisplayOption.value = formSchemaId;
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
      const currentSubType = objectData.value?.domains?.[props.domainId]?.subType;
      const availableFormSchemas: { text: string; value: string | undefined }[] = formSchemas.value
        .filter((formSchema) => formSchema.modelType === props.objectSchema?.title && (!currentSubType || currentSubType === formSchema.subType))
        .map((formSchema) => ({
          text: formSchema.name[locale.value] || formSchema.subType,
          value: formSchema.id
        }));
      availableFormSchemas.unshift({ text: upperFirst(t('objectView').toString()), value: 'objectschema' });
      return availableFormSchemas;
    });

    watch(selectedDisplayOption, () => fetch());

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
        if (formSchemaId) {
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
    const formErrors: Ref<Map<string, string[]>> = ref(new Map());

    watch(
      () => formErrors.value,
      () => {
        emit('update:valid', !formErrors.value.size);
      }
    );

    const reactiveFormActions: ComputedRef<IVeoFormsReactiveFormActions> = computed(() => {
      return props.objectSchema?.title === 'person' ? personReactiveFormActions() : {};
    });

    // side menu stuff
    const selectedSideContainer = ref<undefined | SIDE_CONTAINERS>(undefined);

    // Messages stuff
    const messages = computed(() => ({
      errors: Array.from(formErrors.value).map(([objectSchemaPointer, messages]) => ({ code: objectSchemaPointer, message: messages[0] })),
      warnings: (props.objectMetaData.inspectionFindings || [])
        .filter((warning: IVeoInspectionResult) => warning.severity === 'WARNING')
        .map((warning: IVeoInspectionResult) => formatWarning(warning)),
      information: objectInformation.value
    }));

    const objectInformation = computed<VeoSchemaValidatorMessage[]>(() => {
      const information: VeoSchemaValidatorMessage[] = [];
      const decisionRules = domain.value?.decisions?.piaMandatory?.rules || [];

      if (objectData.value?.domains?.[props.domainId]?.subType === 'PRO_DataProcessing') {
        const decisionName = domain.value?.decisions?.piaMandatory?.name[locale.value] || Object.values(domain.value?.decisions?.piaMandatory?.name || {})[0];
        if (props.objectMetaData?.decisionResults?.piaMandatory?.value !== undefined) {
          if (props.objectMetaData.decisionResults.piaMandatory.value) {
            information.push({
              code: 'I_PIA_MANDATORY',
              message: `${decisionName}: ${t('global.button.yes').toString()}`,
              params: {
                type: 'info'
              },
              decisionRules,
              matchingRules: props.objectMetaData?.decisionResults?.piaMandatory?.matchingRules || []
            });
          } else {
            information.push({
              code: 'I_PIA_NOT_MANDATORY',
              message: `${decisionName}: ${t('global.button.no').toString()}`,
              params: {
                type: 'success'
              },
              decisionRules,
              matchingRules: props.objectMetaData?.decisionResults?.piaMandatory?.matchingRules || []
            });
          }
        } else {
          information.push({
            code: 'I_PIA_MANDATORY_UNKNOWN',
            message: `${decisionName}: ${upperFirst(t('unknown').toString())}`,
            params: {
              type: 'info'
            },
            decisionRules,
            matchingRules: props.objectMetaData?.decisionResults?.piaMandatory?.matchingRules || []
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

    // For some reason putting this in a useFetch and using fetchDecisions as the name for the fetch hook caused all useFetch to be refetched
    const fetchDecisions = async () => {
      const toReturn: any = { ...props.objectMetaData, decisionResults: {}, inspectionFindings: [] };

      // Fetch updated decision results and merge them with the current values
      if (objectData.value?.domains?.[props.domainId]) {
        for (const key in props.objectMetaData?.decisionResults || {}) {
          const result = await $api.entity.fetchWipDecisionEvaluation(objectData.value.type, objectData.value as any, props.domainId, key);
          toReturn.inspectionFindings.push(...result.inspectionFindings);
          toReturn.decisionResults[key] = result.decisionResults.piaMandatory;
        }
        emit('update:object-meta-data', toReturn);
      }
    };

    watch(
      () => objectData.value,
      () => debounce(fetchDecisions, 1000)(),
      { deep: true }
    );

    return {
      localAdditionalContext,
      currentFormSchema,
      displayOptions,
      formErrors,
      formLoading,
      formSchemaHasGroups,
      locale,
      messages,
      mergedTranslations,
      objectData,
      reactiveFormActions,
      selectedDisplayOption,
      selectedSideContainer,

      mdiEyeOutline,
      mdiFormatListBulleted,
      mdiHistory,
      mdiInformationOutline,
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
