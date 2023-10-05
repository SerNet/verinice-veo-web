<template>
  <BaseDialog
    :model-value="showDialog"
    :title="t('editRequirementImplementation')"
    :close-disabled="view.isLoading || view.formIsDirty"
    large
    @keydown.enter="submitForm"
    @update:model-value="emit('update:show-dialog', $event)"
  >
    <BaseCard>
      <v-card-text
        v-if="item"
      >
        <!-- Read only text fields -->
        <v-text-field
          :label="t('requirement')"
          :model-value="form?.control?.displayName"
          readonly
          variant="underlined"
        />

        <v-text-field
          :label="t('riskAffected')"
          :model-value="form?.origin?.displayName"
          readonly
          variant="underlined"
        />

        <!-- Description -->
        <v-textarea
          v-model="form.implementationStatement"
          :label="t('description')"
          variant="underlined"
        />

        <!-- Originiation -->
        <v-radio-group
          :model-value="form?.origination"
          inline
        >
          <template #label>
            <div>{{ t('origination') }}</div>
          </template>

          <template
            v-for="(key, value) in Origination"
            :key="key"
          >
            <v-radio
              :label="t(`originationValues.${value}`)"
              :value="`${key}`"
            />
          </template>
        </v-radio-group>

        <!-- Responsible person -->
        <v-autocomplete
          v-model="form.responsible"
          :label="t('responsible')"
          :items="persons || []"
          :hint="!view.isEditingResponsiblePerson ? t('autocompleteHint'): ''"
          :readonly="!view.isEditingResponsiblePerson"
          clearable
          item-title="displayName"
          item-value="displayName"
          return-object
          variant="underlined"
          class="my-4"
        />

        <!-- Status -->
        <v-radio-group
          v-model="form.status"
          inline
        >
          <template #label>
            <div>{{ t('status') }}</div>
          </template>

          <template
            v-for="(key, value) in Status"
            :key="key"
          >
            <v-radio
              :label="t(`statusValues.${value}`)"
              :value="`${key}`"
            />
          </template>
        </v-radio-group>
      </v-card-text>
      <ObjectFormSkeletonLoader v-else />
    </BaseCard>
    <template #dialog-options>
      <v-btn
        flat
        variant="plain"
        :disabled="view.isLoading"
        @click="emit('update:show-dialog', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        class="mt-2"
        variant="plain"
        color="primary"
        :loading="view.isLoading"
        :disabled="view.isLoading"
        @click="() => submitForm({
          type: state.type.value,
          riskAffected: state.riskAffected.value,
          form,
          item: item,
          request
        })"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { useCompliance } from './compliance';
import { cloneDeep } from 'lodash';
import { useQuery } from '~/composables/api/utils/query';
import objectQueryDefinitions, { IVeoFetchObjectsParameters } from '~/composables/api/queryDefinitions/objects';

const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

import { useRequest } from '@/composables/api/utils/request';
const { request } = useRequest();

const { t } = useI18n();
const { getRequirementImplementationId, state } = useCompliance();

interface Props {
  item: RequirementImplementation;
  showDialog: boolean;
}

interface Emits {
  (e: 'update:show-dialog', value: boolean): void
  (e: 'update:item'): void
}

interface RequirementImplementation {
  origin: {
    displayName: string,
    targetUri: string,
    searchesUri: string
  },
  control: {
    displayName: string,
    targetUri: string,
    searchesUri: string
  },
  status: 'UNKNOWN | YES | PARTIAL | NO | N_A',
  origination: "SYSTEM_SPECIFIC",
  _self: string,
  implementationStatement?: string | null,
  responsible?: null | {
    displayName: string,
    targetUri: string,
    searchesUri: string,
    resourcesUri: string
  }
}

type Form = RequirementImplementation | null;

enum Origination {
  SystemSpecific = 'SYSTEM_SPECIFIC',
  // Inherited = 'INHERITED',
  // Organisation = 'ORGANISATION'
}

enum Status {
  Unknown = "UNKNOWN",
  Yes = "YES",
  Partial = "PARTIAL",
  No = "NO",
  NA = 'N_A'
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/** STATE */
// data
const initialForm = {
  origin: {},
  control: {},
  responsible: null,
  status: 'UNKNOWN',
  implementationStatement: null,
  origination: "SYSTEM_SPECIFIC"
};

const form: Ref<Form> = ref(null);
const _item = computed(() => props.item);

watch(_item, () => {
  form.value = {
    ...initialForm,
    ..._item.value
  };
});

// Responsible persons => loaded from all domains
const fetchPersonsQueryParameters = computed<IVeoFetchObjectsParameters>(() => ({
  endpoint: 'persons'
}));

const { data: _persons } = useQuery(objectQueryDefinitions.queries.fetchAll, fetchPersonsQueryParameters);
const persons = computed(() => _persons?.value?.items || []);

// view
const view = reactive({
  isEditingResponsiblePerson: props?.item?.responsible?.displayName ? false : true,
  isLoading: false,
  formIsDirty: false
});

async function submitForm({
  type,
  riskAffected,
  form,
  item,
  request
}:{type: string, riskAffected: string, form: RequirementImplementation , item: any, request: any}) {
  view.isLoading = true;
  const _form  = cloneDeep(form);

  if (_form.responsible) {
    _form.responsible = mapResponsible(_form);
  }

  // Filter out empty properties
  const requirementImplementation = Object.fromEntries(
    Object.entries(_form)
      .filter(([,value]) => value !== null)
  );

  const requirementImplementationId = getRequirementImplementationId(item._self);
  const url = `/api/${type}/${riskAffected}/requirement-implementations/${requirementImplementationId}`;

  try {
    await request(url, {
      method: 'PUT',
      json: requirementImplementation,
      params: {id: requirementImplementationId}
    });
    emit('update:item')
    displaySuccessMessage(t('requirementImplementationUpdated'));
  }
  catch (error: any) {
    displayErrorMessage(t('requirementImplementationNotUpdated'), error.message);
  }
  finally {
    view.isLoading = false;
    emit('update:show-dialog', false);
  }
}

function mapResponsible(form: any) {
  return {
    displayName: form.responsible.displayName,
    resourcesUri: form.control.resourcesUri,
    searchesUri: form.control.searchesUri,
    targetUri: form.responsible.targetUri ?
      form.responsible.targetUri :
      form.responsible._self
  };
}
</script>

<i18n>
{
"de": {
  "requirement": "Anforderung:",
  "riskAffected": "Objekt:",
  "description": "Umsetzungsbeschreibung",
  "origination": "Umsetzungsherkunft",
  "originationValues": {
    "SystemSpecific": "Systemspezifisch",
    "Inherited": "Vererbung",
    "Organisation": "Organisation"
  },
  "status": "Status der Umsetzung",
  "statusValues": {
    "Unknown": "Unbearbeitet",
    "Yes": "Ja",
    "Partial": "Teilweise",
    "No": "Nein",
    "NA": "Nicht anwendbar"
  },
  "responsible": "Verantwortlich",
  "autocompleteHint": "Click the icon to edit",
  "editRequirementImplementation": "RequirementImplementation bearbeiten"
},
"en": {
  "requirement": "Anforderung:",
  "riskAffected": "Objekt:",
  "description": "Umsetzungsbeschreibung",
  "origination": "Umsetzungsherkunft",
  "originationValues": {
    "SystemSpecific": "Systemspezifisch",
    "Inherited": "Vererbung",
    "Organisation": "Organisation"
  },
  "status": "Status der Umsetzung",
  "statusValues": {
    "Unknown": "Unbearbeitet",
    "Yes": "Ja",
    "Partial": "Teilweise",
    "No": "Nein",
    "NA": "Nicht anwendbar"
  },
  "responsible": "Verantwortlich",
  "autocompleteHint": "Click the icon to edit",
  "editRequirementImplementation": "RequirementImplementation bearbeiten"
}
}
</i18n>

<style scoped lang="scss">
</style>
