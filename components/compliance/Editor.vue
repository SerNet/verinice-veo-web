<!--
 - verinice.veo web
   - Copyright (C) 2024 Aziz Khalledi
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BaseDialog
    :model-value="showDialog"
    :title="t('riEditor.editRequirementImplementation')"
    :close-disabled="view.isLoading || view.formIsDirty"
    large
    fixed-footer
    data-veo-test="compliance-editor"
    @keydown.enter="submitForm"
    @update:model-value="emit('update:show-dialog', $event)"
  >
    <BaseCard>
      <!-- Loading state -->
      <v-card-text v-if="!item || view.isLoading">
        <v-skeleton-loader class="mb-4" type="list-item-two-line" />
        <v-skeleton-loader class="mb-4" type="paragraph" />
        <v-skeleton-loader class="mb-4" type="article" />
      </v-card-text>

      <v-card-text v-if="item && !view.isLoading">
        <!-- Target object section -->
        <v-label class="mt-4">{{ t('riEditor.targetObject') }}</v-label>
        <BaseCard border padding>
          <ComplianceEditorRiMetaData
            v-for="property in config.riEditor.renderedProperties.targetObject"
            :key="property.key"
            :property="property"
            :data="form.origin"
            :additional-info="additionalInfo"
          />
        </BaseCard>

        <!-- Control section -->
        <v-label class="mt-4">{{ ciSubType }}</v-label>
        <BaseCard border padding>
          <DynamicFormEntrypoint
            v-if="controlFormSchema"
            v-model="form.control"
            :disabled="true"
            :object-schema="objectSchema"
            :form-schema="controlFormSchema.content"
            :domain="currentDomain?.raw"
            :translations="mergedTranslations"
          />
          <ComplianceEditorRiMetaData
            v-for="property in config.riEditor.renderedProperties.control"
            v-else
            :key="property.key"
            :property="property"
            :data="form.control"
            :additional-info="additionalInfo"
          />
        </BaseCard>

        <!-- Editable implementation details -->
        <v-label class="mt-4">{{ t('riEditor.implementation') }}</v-label>
        <BaseCard border padding margin-bottom>
          <!-- Umsetzung -->
          <v-card class="mb-6">
            <v-card-title>{{ t('riEditor.implementationCard') }}</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.status"
                    :label="t('riEditor.status')"
                    :aria-label="t('riEditor')"
                    :items="statusValues"
                    item-title="label"
                    item-value="value"
                    :disabled="!canManageUnitContent"
                    variant="underlined"
                    data-veo-test="riEditor-status"
                  />
                </v-col>

                <v-col cols="12" md="8">
                  <v-autocomplete
                    v-model="form.responsible"
                    :label="t('riEditor.responsible')"
                    :aria-label="t('riEditor.responsible')"
                    :items="persons"
                    item-title="name"
                    item-value="name"
                    :disabled="!canManageUnitContent"
                    clearable
                    variant="underlined"
                    return-object
                    data-veo-test="compliance-editor-ri-responsible-person"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="form.implementationUntil"
                    v-model:menu="implementationUntilMenu"
                    :aria-expanded="implementationUntilMenu"
                    :label="t('riEditor.implementationUntil')"
                    :aria-label="t('riEditor.implementationUntil')"
                    :disabled="!canManageUnitContent"
                    prepend-icon=""
                    role="combobox"
                    prepend-inner-icon="$calendar"
                    clearable
                    variant="underlined"
                    data-veo-test="riEditor-implementationUntil"
                    @click:clear="form.implementationUntil = undefined"
                  />
                </v-col>

                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="form.cost"
                    :label="t('riEditor.cost')"
                    :aria-label="t('riEditor.cost')"
                    :disabled="!canManageUnitContent"
                    variant="underlined"
                    :rules="[numberValidator]"
                    data-veo-test="riEditor-cost"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Dokumentation -->
          <v-card class="mb-6">
            <v-card-title>{{ t('riEditor.documentationCard') }}</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="form.implementationDate"
                    v-model:menu="implementationDateMenu"
                    :aria-expanded="implementationDateMenu"
                    :label="t('riEditor.implementationDate')"
                    :aria-label="t('riEditor.implementationDate')"
                    :disabled="!canManageUnitContent"
                    prepend-icon=""
                    role="combobox"
                    prepend-inner-icon="$calendar"
                    clearable
                    variant="underlined"
                    data-veo-test="riEditor-implementationDate"
                    @click:clear="form.implementationDate = undefined"
                  />
                </v-col>

                <v-col cols="12" md="8">
                  <v-autocomplete
                    v-model="form.implementedBy"
                    :label="t('riEditor.implementedBy')"
                    :aria-label="t('riEditor.implementedBy')"
                    :items="persons"
                    :disabled="!canManageUnitContent"
                    item-title="name"
                    item-value="name"
                    clearable
                    required
                    return-object
                    variant="underlined"
                    data-veo-test="riEditor-implementedBy"
                    @click:clear="form.implementedBy = undefined"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="form.assessmentDate"
                    v-model:menu="assessmentDateMenu"
                    :aria-expanded="assessmentDateMenu"
                    :label="t('riEditor.assessmentDate')"
                    :aria-label="t('riEditor.assessmentDate')"
                    :disabled="!canManageUnitContent"
                    prepend-icon=""
                    prepend-inner-icon="$calendar"
                    role="combobox"
                    clearable
                    variant="underlined"
                    data-veo-test="riEditor-assessmentDate"
                    @click:clear="form.assessmentDate = undefined"
                  />
                </v-col>

                <v-col cols="12" md="8">
                  <v-autocomplete
                    v-model="form.assessmentBy"
                    :label="t('riEditor.assessmentBy')"
                    :aria-label="t('riEditor.assessmentBy')"
                    :items="persons"
                    :disabled="!canManageUnitContent"
                    item-title="name"
                    item-value="name"
                    clearable
                    return-object
                    variant="underlined"
                    data-veo-test="riEditor-assessmentBy"
                    @click:clear="form.assessmentBy = undefined"
                  />
                </v-col>

                <v-col cols="12" md="12">
                  <v-textarea
                    v-model="form.implementationStatement"
                    :label="t('riEditor.description')"
                    :aria-label="t('riEditor.description')"
                    :disabled="!canManageUnitContent"
                    variant="underlined"
                    rows="2"
                    data-veo-test="riEditor-description"
                  />
                </v-col>

                <v-col cols="12" md="12">
                  <v-select
                    v-model="form.document"
                    :label="t('riEditor.document')"
                    :aria-label="t('riEditor.document')"
                    :items="documents"
                    item-title="name"
                    item-value="name"
                    :disabled="!canManageUnitContent"
                    return-object
                    variant="underlined"
                    data-veo-test="riEditor-document"
                    @click:clear="form.document = undefined"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Revisionen -->
          <v-card>
            <v-card-title>{{ t('riEditor.revisionCard') }}</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="form.lastRevisionDate"
                    v-model:menu="lastRevisionDateMenu"
                    :aria-expanded="lastRevisionDateMenu"
                    :label="t('riEditor.lastRevisionDate')"
                    :aria-label="t('riEditor.lastRevisionDate')"
                    :disabled="!canManageUnitContent"
                    prepend-icon=""
                    prepend-inner-icon="$calendar"
                    clearable
                    role="combobox"
                    variant="underlined"
                    data-veo-test="riEditor-lastRevisionDate"
                    @click:clear="form.lastRevisionDate = undefined"
                  />
                </v-col>

                <v-col cols="12" md="8">
                  <v-autocomplete
                    v-model="form.lastRevisionBy"
                    :label="t('riEditor.lastRevisionBy')"
                    :aria-label="t('riEditor.lastRevisionBy')"
                    :items="persons"
                    :disabled="!canManageUnitContent"
                    item-title="name"
                    item-value="name"
                    clearable
                    return-object
                    variant="underlined"
                    data-veo-test="riEditor-lastRevisionBy"
                    @click:clear="form.lastRevisionBy = undefined"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-date-input
                    v-model="form.nextRevisionDate"
                    v-model:menu="nextRevisionMenu"
                    :aria-expanded="nextRevisionMenu"
                    :label="t('riEditor.nextRevisionDate')"
                    :aria-label="t('riEditor.nextRevisionDate')"
                    :disabled="!canManageUnitContent"
                    role="combobox"
                    prepend-icon=""
                    prepend-inner-icon="$calendar"
                    clearable
                    variant="underlined"
                    data-veo-test="riEditor-nextRevisionDate"
                    @click:clear="form.nextRevisionDate = undefined"
                  />
                </v-col>

                <v-col cols="12" md="8">
                  <v-autocomplete
                    v-model="form.nextRevisionBy"
                    :label="t('riEditor.nextRevisionBy')"
                    :aria-label="t('riEditor.nextRevisionBy')"
                    :items="persons"
                    :disabled="!canManageUnitContent"
                    item-title="name"
                    item-value="name"
                    clearable
                    return-object
                    variant="underlined"
                    data-veo-test="riEditor-nextRevisionBy"
                    @click:clear="form.nextRevisionDate = undefined"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </BaseCard>
      </v-card-text>
      <ObjectFormSkeletonLoader v-else />
    </BaseCard>

    <!-- Dialog footer buttons -->
    <template #dialog-options>
      <v-btn flat variant="plain" :disabled="view.isLoading" @click="emit('update:show-dialog', false)">
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        class="mt-2"
        variant="plain"
        color="primary"
        :loading="view.isLoading"
        :disabled="view.isLoading || !canManageUnitContent"
        @click="
          () =>
            void (
              route.query.targetObject &&
              submitForm({
                type: VeoElementTypePlurals[route.query.type as keyof typeof VeoElementTypePlurals],
                riskAffected: route.query.targetObject as string,
                form,
                item: item,
                request
              })
            )
        "
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
// ===== External dependencies =====
import { cloneDeep, merge } from 'lodash';

// ===== Internal components =====
import DynamicFormEntrypoint from '~/components/dynamic-form/Entrypoint.vue';
import ComplianceEditorRiMetaData from './editorRiMetaData.vue';

// ===== API and composables =====
import { useRequest } from '@/composables/api/utils/request';
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import type { IVeoFetchObjectParameters, IVeoFetchObjectsParameters } from '~/composables/api/queryDefinitions/objects';
import controlQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import type { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';

// ===== Types and interfaces =====
import type { IVeoEntity, IVeoLink, RequirementImplementation, ResponsiblePerson } from '~/types/VeoTypes';
import { RI_CONTROL_VIEW_CONTEXT, VeoElementTypePlurals } from '~/types/VeoTypes';
import { isVeoLink, validateType } from '~/types/utils';
import { format } from 'date-fns';
import { useFetchObjects } from '~/composables/api/objects';

// ===== Type definitions =====
interface Props {
  item: RequirementImplementation | null;
  showDialog: boolean;
  locale: string;
}

interface Emits {
  (e: 'update:show-dialog', value: boolean): void;
}

const statusValues = computed(() =>
  Object.values(Status).map((value) => ({
    value,
    label: t(`riEditor.statusValues.${value}`)
  }))
);

type RequirementImplementationForForm = {
  origin: Partial<IVeoLink>;
  control: Partial<IVeoEntity>;
  responsible?: ResponsiblePerson;
  status: string;
  origination: string;
  implementationUntil?: string;
  implementedBy?: ResponsiblePerson;
  cost?: number;
  implementationStatement?: string;
  implementationDate?: string;
  assessmentDate?: string;
  assessmentBy?: ResponsiblePerson;
  document?: any;
  lastRevisionDate?: string;
  lastRevisionBy?: ResponsiblePerson;
  nextRevisionDate?: string;
  nextRevisionBy?: ResponsiblePerson;
};

export type TAdditionalInfo = {
  originationDescription?: string;
  protectionApproach?: string;
  targetObjectDescription?: string;
  protectionApproachTranslation?: string;
};

// ===== Menu refs for aria labels =====
const nextRevisionMenu = ref(false);
const lastRevisionDateMenu = ref(false);
const implementationUntilMenu = ref(false);
const implementationDateMenu = ref(false);
const assessmentDateMenu = ref(false);

// ===== Props and emits =====
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// ===== Utilities and hooks =====
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t } = useVeoI18n();
const route = useRoute();
const { request } = useRequest();
const { updateItem } = useRequirementImplementationQuery();
const { data: config } = useConfiguration();
const { data: currentDomain } = useCurrentDomain();

// ===== Constants =====
enum Status {
  Unknown = 'UNKNOWN',
  Yes = 'YES',
  Partial = 'PARTIAL',
  No = 'NO',
  NA = 'N_A'
}

// ===== State management =====
// Form state
const initialForm: RequirementImplementationForForm = {
  origin: {},
  control: {},
  responsible: null,
  status: Status.Unknown,
  implementationStatement: null,
  origination: 'SYSTEM_SPECIFIC',
  cost: null,
  implementationDate: null,
  implementedBy: null,
  assessmentDate: null,
  assessmentBy: null,
  document: null,
  lastRevisionDate: null,
  lastRevisionBy: null,
  nextRevisionDate: null,
  nextRevisionBy: null
};

const form = ref<RequirementImplementationForForm>(initialForm);
const additionalInfo = ref<TAdditionalInfo>({});

// View state
const view = reactive({
  isLoading: false,
  formIsDirty: false
});

// ===== Route and context parameters =====
const unitId = computed(() => route.params.unit);
const currentDomainId = computed(() => route.params.domain);

// ===== API query parameters =====
// Object queries
const targetObjectParameters = computed<IVeoFetchObjectParameters>(() => ({
  id: props.item?.origin.id as string,
  domain: currentDomainId.value as string,
  endpoint: VeoElementTypePlurals[props.item?.origin.type]
}));

const controlParameters = computed<IVeoFetchObjectParameters>(() => ({
  id: props.item?.control.id as string,
  domain: currentDomainId.value as string,
  endpoint: 'controls'
}));

// Forms and schemas queries
const formsQueryParameters = computed(() => ({
  domainId: route.params.domain as string
}));
const formsQueryEnabled = computed(() => !!currentDomainId.value);

const fetchSchemaQueryParameters = computed(() => ({
  type: 'controls',
  domainId: currentDomainId.value as string
}));
const fetchSchemaQueryEnabled = computed(() => !!currentDomainId.value);

const { data: translations } = useTranslations({ domain: currentDomainId.value });

// Fetch forms and schemas
const { data: formSchemas } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, {
  enabled: formsQueryEnabled,
  placeholderData: []
});

// Fetch objects
const { data: targetObject } = useQuery(controlQueryDefinitions.queries.fetch, targetObjectParameters, {
  enabled: computed(() => !!props.item?.control.id)
});

const { data: control } = useQuery(controlQueryDefinitions.queries.fetch, controlParameters, {
  enabled: computed(() => !!props.item?.control.id)
});

const { data: objectSchema } = useQuery(schemaQueryDefinitions.queries.fetchSchema, fetchSchemaQueryParameters, {
  enabled: fetchSchemaQueryEnabled
});

// Form schema selection - Move this up before it's used
const selectedFormSchema = computed(() => {
  if (!formSchemas.value || !props.item || !targetObject.value) return null;

  const riOwnerType = targetObject.value.type;
  const riOwnerSubType = targetObject.value.subType;

  // 1. Check for RI-Control form for specific subtype of current RI-Owner
  const specificSubtypeForm = formSchemas.value.find(
    (form) =>
      form.modelType === riOwnerType && form.context === RI_CONTROL_VIEW_CONTEXT && form.subType === riOwnerSubType
  );

  if (specificSubtypeForm) {
    return specificSubtypeForm;
  }

  // 2. Check for RI-Control form for all subtypes of current RI-Owner
  const allSubtypesForm = formSchemas.value.find(
    (form) => form.modelType === riOwnerType && form.context === RI_CONTROL_VIEW_CONTEXT
  );

  if (allSubtypesForm) {
    return allSubtypesForm;
  }

  // 3. Check for RI-Control form for all object types
  const allObjectTypesForm = formSchemas.value.find(
    (form) => form.modelType == null && form.context === RI_CONTROL_VIEW_CONTEXT
  );

  if (allObjectTypesForm) {
    return allObjectTypesForm;
  }

  return null;
});

// Form query parameters using selectedFormSchema
const formQueryParameters = computed(() => ({
  id: selectedFormSchema.value?.id
}));
const formQueryEnabled = computed(() => !!formQueryParameters.value.id);

const translationQueryParameters = computed(() => ({
  languages: [props.locale],
  domain: currentDomainId.value
}));

const { data: fetchedTranslations } = useQuery(translationQueryDefinitions.queries.fetch, translationQueryParameters);

const { data: controlFormSchema } = useQuery(formQueryDefinitions.queries.fetchForm, formQueryParameters, {
  enabled: formQueryEnabled
});

// ===== API object data fetching =====
const canFetchObjectData = computed(() => !!currentDomainId.value && !!unitId.value);

// Fetch persons
const personsQueryParams = computed<IVeoFetchObjectsParameters>(() => ({
  endpoint: 'persons',
  domain: Array.isArray(currentDomainId.value) ? currentDomainId.value[0] : currentDomainId.value,
  unit: Array.isArray(unitId.value) ? unitId.value[0] : unitId.value,
  size: '5000'
}));

const { data: _persons } = useFetchObjects(personsQueryParams, {
  enabled: canFetchObjectData,
  keepPreviousData: true
});

// Fetch documents
const documentQueryParams = computed<IVeoFetchObjectsParameters>(() => ({
  endpoint: 'documents',
  domain: Array.isArray(currentDomainId.value) ? currentDomainId.value[0] : currentDomainId.value,
  unit: Array.isArray(unitId.value) ? unitId.value[0] : unitId.value,
  size: '5000'
}));

const { data: _documents } = useFetchObjects(documentQueryParams, {
  enabled: canFetchObjectData,
  keepPreviousData: true
});

// ===== Computed properties =====
// Translations
const mergedTranslations = computed<IVeoTranslations['lang']>(() =>
  merge({}, fetchedTranslations.value?.lang || {}, controlFormSchema.value?.translation || {})
);

// @ts-ignore TODO #3066 ComputedRef<string> is not assignable to type string
const protectionApproachTranslation = computed(() =>
  translateProtectionApproach({
    translations: translations.value,
    locale: props.locale,
    protectionApproach: additionalInfo.value.protectionApproach
  })
);

const { subTypeTranslation: ciSubType } = useSubTypeTranslation(
  toRef(() => control.value?.type),
  toRef(() => control.value?.subType),
  false
);

// ===== Helper functions =====
// Persons
const persons = computed(() => mapPersons(_persons?.value?.items as IVeoEntity[]) ?? []);

function mapPersons(persons: IVeoEntity[]): ResponsiblePerson[] {
  if (!persons) return [];
  return persons.map((person) => ({
    name: person.name,
    targetUri: person._self
  }));
}

// Documents
const documents = computed(() => mapDocuments(_documents?.value?.items as IVeoEntity[]) ?? []);

function mapDocuments(documents: IVeoEntity[]) {
  if (!documents) return [];
  return documents.map((document) => ({
    name: document.name,
    targetUri: document._self
  }));
}

function translateProtectionApproach({ translations, locale, protectionApproach }): string {
  if (!translations?.lang || !locale || !protectionApproach) return '';
  return translations.lang[locale][protectionApproach];
}

function updateAdditionalInfo(control: IVeoEntity, targetObject: IVeoEntity, protectionApproachTranslation: string) {
  // Target object
  additionalInfo.value.targetObjectDescription = targetObject?.description;

  // Control
  const customAspects = control?.customAspects;
  if (!customAspects) return;

  // TODO: make it configurable:
  additionalInfo.value.originationDescription =
    customAspects?.control_bpCompendium?.control_bpCompendium_content ??
    customAspects?.control_nis2Article?.control_nis2Article_content ??
    customAspects?.control_bcmRequirement?.control_bcmRequirement_content ??
    control?.description ??
    '';

  additionalInfo.value.protectionApproach =
    customAspects?.['control_bpInformation']?.control_bpInformation_protectionApproach;
  additionalInfo.value.protectionApproachTranslation = protectionApproachTranslation;
}

// ===== Rules =====
const { numberValidator } = useRules();

// ===== Event handlers =====
async function submitForm({
  type,
  riskAffected,
  form,
  item
}: {
  type: string;
  riskAffected: string;
  form: RequirementImplementationForForm;
  item: any;
  request: any;
}) {
  if (!form) return;

  view.isLoading = true;

  // Filter out empty properties
  const clone = cloneDeep(form);
  const _form: RequirementImplementation = {
    ...clone,
    control: { targetUri: clone.control._self },
    origin: validateType(clone.origin, isVeoLink),
    implementationUntil: form.implementationUntil ? format(form.implementationUntil, 'yyyy-MM-dd') : undefined,
    implementationDate: form.implementationDate ? format(form.implementationDate, 'yyyy-MM-dd') : undefined,
    lastRevisionDate: form.lastRevisionDate ? format(form.lastRevisionDate, 'yyyy-MM-dd') : undefined,
    nextRevisionDate: form.nextRevisionDate ? format(form.nextRevisionDate, 'yyyy-MM-dd') : undefined,
    assessmentDate: form.assessmentDate ? format(form.assessmentDate, 'yyyy-MM-dd') : undefined
  };

  // Filter null values
  const requirementImplementation = Object.fromEntries(Object.entries(_form).filter(([, value]) => value != null));

  try {
    await updateItem({
      endpoint: type,
      id: riskAffected,
      requirementId: item?.control?.id,
      requirementImplementation: requirementImplementation
    });
    displaySuccessMessage(t('riEditor.requirementImplementationUpdated'));
  } catch (error: any) {
    displayErrorMessage(t('riEditor.requirementImplementationNotUpdated'), error.message);
  } finally {
    view.isLoading = false;
    emit('update:show-dialog', false);
  }
}

// ===== Watchers and lifecycle hooks =====
// Update form when item changes
const _item = computed(() => props.item);
watch([_item, control], () => {
  if (!_item.value) return;
  form.value = {
    ..._item.value,
    control: control.value
  };
});

// Update additional info when relevant data changes
watch(
  [control, targetObject, protectionApproachTranslation],
  () => updateAdditionalInfo(control.value, targetObject.value, protectionApproachTranslation.value),
  { immediate: true }
);

const { ability, subject } = useVeoPermissions();
const canManageUnitContent = computed(() => ability.value.can('manage', subject('units', { id: route.params.unit })));
</script>

<i18n src="~/locales/base/components/compliance-editor.json"></i18n>
