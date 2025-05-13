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
          <!-- Responsible person -->
          <v-autocomplete
            v-model="form.responsible"
            :label="t('riEditor.responsible')"
            :items="persons"
            clearable
            item-title="name"
            item-value="name"
            return-object
            variant="underlined"
            class="my-4"
            data-veo-test="compliance-editor-ri-responsible-person"
          />

          <!-- Implementation date -->
          <!-- @click:clear
            in vuetify 3.6.xx `clearable` doesn't reset the value when clearing the input,
            thus v-model is being reset manually
          -->
          <v-date-input
            v-model="form.implementationUntil"
            :label="t('riEditor.implementationUntil')"
            :aria-label="t('riEditor.implementationUntil')"
            data-veo-test="compliance-editor-ri-implementation-date"
            prepend-icon=""
            prepend-inner-icon="$calendar"
            clearable
            role="combobox"
            @click:clear="form.implementationUntil = undefined"
          >
          </v-date-input>

          <!-- Status -->
          <v-radio-group v-model="form.status" inline>
            <template #label>
              <div>{{ t('riEditor.status') }}</div>
            </template>
            <template v-for="(key, value) in Status" :key="key">
              <v-radio
                :label="t(`riEditor.statusValues.${value}`)"
                :value="`${key}`"
                :data-veo-test="`compliance-editor-staus-${value}`"
              />
            </template>
          </v-radio-group>

          <!-- Description -->
          <v-textarea
            v-model="form.implementationStatement"
            :label="t('riEditor.description')"
            variant="underlined"
            data-veo-test="compliance-editor-description"
          />
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
        :disabled="view.isLoading"
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
import { format } from 'date-fns';
import { cloneDeep, merge } from 'lodash';
import { useDate } from 'vuetify';

// ===== Internal components =====
import DynamicFormEntrypoint from '~/components/dynamic-form/Entrypoint.vue';
import ComplianceEditorRiMetaData from './editorRiMetaData.vue';

// ===== API and composables =====
import { useRequest } from '@/composables/api/utils/request';
import domainQueryDefinitions, {
  IVeoFetchPersonsInDomainParameters,
  IVeoPersonInDomain
} from '~/composables/api/queryDefinitions/domains';
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import controlQueryDefinitions, { IVeoFetchObjectParameters } from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import translationQueryDefinitions, { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';

// ===== Types and interfaces =====
import type { IVeoEntity, IVeoLink, RequirementImplementation, ResponsiblePerson } from '~/types/VeoTypes';
import { contextKeys, VeoElementTypePlurals } from '~/types/VeoTypes';
import { isVeoLink, validateType } from '~/types/utils';

// ===== Type definitions =====
interface Props {
  item: RequirementImplementation | null;
  showDialog: boolean;
  locale: string;
}

interface Emits {
  (e: 'update:show-dialog', value: boolean): void;
}

type RequirementImplementationForForm = {
  origin: Partial<IVeoLink>;
  control: Partial<IVeoLink>;
  responsible?: ResponsiblePerson;
  status: string;
  origination: string;
  implementationStatement?: string;
  implementationUntil?: Date;
};

export type TAdditionalInfo = {
  originationDescription?: string;
  protectionApproach?: string;
  targetObjectDescription?: string;
  protectionApproachTranslation?: string;
};

// ===== Props and emits =====
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// ===== Utilities and hooks =====
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t } = useVeoI18n();
const adapter = useDate();
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

const RI_CONTROL_VIEW_CONTEXT = contextKeys[1];

// ===== State management =====
// Form state
const initialForm: RequirementImplementationForForm = {
  origin: {},
  control: {},
  responsible: null,
  status: 'UNKNOWN',
  implementationStatement: null,
  origination: 'SYSTEM_SPECIFIC'
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

// Domain and persons queries
const totalItemCount = computed(() => _personsForTotalItemCount?.value?.totalItemCount);
const fetchPersonsForTotalItemCountEnabled = computed(() => !!currentDomainId.value && !!unitId.value);
const totalItemCountQueryParameters = computed<IVeoFetchPersonsInDomainParameters>(() => ({
  domainId: currentDomainId.value as string,
  unitId: unitId.value as string,
  size: '1'
}));

const isFetchingPersons = computed(() => !!currentDomainId.value && !!unitId.value && !!totalItemCount);
const fetchPersonsInDomainQueryParameters = computed<IVeoFetchPersonsInDomainParameters>(() => ({
  domainId: currentDomainId.value as string,
  unitId: unitId.value as string,
  size: totalItemCount.value
}));

// Forms and schemas queries
const formsQueryParameters = computed(() => ({
  domainId: route.params.domain as string
}));
const formsQueryEnabled = computed(() => !!currentDomainId);

const fetchSchemaQueryParameters = computed(() => ({
  type: 'controls',
  domainId: currentDomainId.value as string
}));
const fetchSchemaQueryEnabled = computed(() => !!currentDomainId.value);

// ===== API data fetching =====
// Fetch persons
const { data: _personsForTotalItemCount } = useQuery(
  domainQueryDefinitions.queries.fetchPersonsInDomain,
  totalItemCountQueryParameters,
  { enabled: fetchPersonsForTotalItemCountEnabled.value }
);

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

const { data: _persons } = useQuery(
  domainQueryDefinitions.queries.fetchPersonsInDomain,
  fetchPersonsInDomainQueryParameters,
  { enabled: isFetchingPersons.value }
);

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

// Persons
const persons = computed(() => mapPersons(_persons?.value?.items as IVeoPersonInDomain[]) ?? []);

// ===== Helper functions =====
function mapPersons(persons: IVeoPersonInDomain[]): ResponsiblePerson[] {
  if (!persons) return [];
  return persons.map((person) => ({
    name: person.name,
    targetUri: person._self
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
    control: validateType(clone.control, isVeoLink),
    origin: validateType(clone.origin, isVeoLink),
    implementationUntil: form.implementationUntil && format(form.implementationUntil, 'yyyy-MM-dd')
  };

  const requirementImplementation = Object.fromEntries(Object.entries(_form).filter(([, value]) => value !== null));

  try {
    updateItem({
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
watch(_item, () => {
  if (!_item.value) return;
  form.value = {
    ..._item.value,
    // TODO #3066 is there some way to get a date adapter that explicitly returns Dates and doesn't need casting?
    implementationUntil:
      _item.value.implementationUntil ? (adapter.parseISO(_item.value.implementationUntil) as Date) : undefined
  };
});

// Update additional info when relevant data changes
watch(
  [control, targetObject, protectionApproachTranslation],
  () => updateAdditionalInfo(control.value, targetObject.value, protectionApproachTranslation.value),
  { immediate: true }
);
</script>

<i18n src="~/locales/base/components/compliance-editor.json"></i18n>
