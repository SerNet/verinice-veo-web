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
          :items="persons"
          clearable
          item-title="name"
          item-value="name"
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
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        class="mt-2"
        variant="plain"
        color="primary"
        :loading="view.isLoading"
        :disabled="view.isLoading"
        @click="() => void(state.riskAffected.value && submitForm({
          type: state.type.value,
          riskAffected: state.riskAffected.value,
          form,
          item: item,
          request
        }))"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { useCompliance } from './compliance';
import { cloneDeep } from 'lodash';
import { useQuery } from '~/composables/api/utils/query';
import domainQueryDefinitions, { IVeoFetchPersonsInDomainParameters, IVeoPersonInDomain } from '~/composables/api/queryDefinitions/domains';

const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

import { useRequest } from '@/composables/api/utils/request';
const { request } = useRequest();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { getRequirementImplementationId, state } = useCompliance();

interface Props {
  item: RequirementImplementation | null;
  showDialog: boolean;
}

interface Emits {
  (e: 'update:show-dialog', value: boolean): void
  (e: 'update:item'): void
}

export type RequirementImplementation = {
  origin: { displayName?: string };
  control: { displayName?: string };
  responsible: ResponsiblePerson | null;
  status: string;
  implementationStatement?: string | null;
  origination: string;
}

type ResponsiblePerson = {
  name: string;
  targetUri: string;
}

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

const route = useRoute();

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

const form: Ref<RequirementImplementation> = ref(initialForm);

// React on changing props, e.g. if a new item is passed
const _item = computed(() => props.item);
watch(_item, () => {
  if(!_item.value) return;
  form.value = {
    ..._item.value
  };
});

// view
const view = reactive({
  isLoading: false,
  formIsDirty: false
});

// Load persons from current unit + current domain
const unitId = computed(()=> route.params.unit);
const domainId = computed(()=> route.params.domain);
const totalItemCount = computed(() => _personsForTotalItemCount?.value?.totalItemCount);

// Fetch to get total number of persons
const isFetchingTotalItemCount = computed(() =>
  !!domainId.value &&
  !!unitId.value
);

const totalItemCountQueryParameters =
  computed<IVeoFetchPersonsInDomainParameters>(() => (
    {
      domainId: domainId.value as string,
      unitId: unitId.value as string,
      size: '1'
    }
  ));

const { data: _personsForTotalItemCount } = useQuery(
  domainQueryDefinitions.queries.fetchPersonsInDomain,
  totalItemCountQueryParameters,
  { enabled: isFetchingTotalItemCount.value }
);

// Fetch again to get all persons in current domain + unit
const isFetchingPersons = computed(() =>
  !!domainId.value &&
  !!unitId.value &&
  !!totalItemCount
);

const fetchPersonsInDomainQueryParameters =
  computed<IVeoFetchPersonsInDomainParameters>(() => (
    {
      domainId: domainId.value as string,
      unitId: unitId.value as string,
      size: totalItemCount.value
    }
  ));

const { data: _persons } = useQuery(
  domainQueryDefinitions.queries.fetchPersonsInDomain,
  fetchPersonsInDomainQueryParameters,
  { enabled: isFetchingPersons.value }
);

const persons = computed(() => mapPersons( _persons?.value?.items as IVeoPersonInDomain[] ));

function mapPersons(persons: IVeoPersonInDomain[]): ResponsiblePerson[] {
  return persons.map(person => ({
    name: person.name,
    targetUri: person._self
  }));
}


async function submitForm({
  type,
  riskAffected,
  form,
  item,
  request
}:{type: string, riskAffected: string, form: RequirementImplementation , item: any, request: any}) {
  if(!form) return;

  view.isLoading = true;

  // Filter out empty properties
  const _form = cloneDeep(form);
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
    emit('update:item');
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
  "editRequirementImplementation": "Anforderung bearbeiten",
  "requirementImplementationNotUpdated": "Anforderung konnte nicht aktualisiert werden.",
  "requirementImplementationUpdated": "Anforderung wurde erfolgreich aktualisiert."
},
"en": {
  "requirement": "Requirement Implementation:",
  "riskAffected": "Target object:",
  "description": "Umsetzungsbeschreibung",
  "origination": "Umsetzungsherkunft",
  "originationValues": {
    "SystemSpecific": "system specific",
    "Inherited": "Inheritance",
    "Organisation": "Organization"
  },
  "status": "Implementation status",
  "statusValues": {
    "Unknown": "unedited",
    "Yes": "yes",
    "Partial": "partial",
    "No": "no",
    "NA": "not applicable"
  },
  "responsible": "responsible",
  "editRequirementImplementation": "edit Requirement Implementation",
  "requirementImplementationNotUpdated": "Requirement Implementation could not be updated.",
  "requirementImplementationUpdated": "Requirement Implementation successfully updated."
}
}
</i18n>