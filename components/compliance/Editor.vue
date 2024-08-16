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
    :title="t('editRequirementImplementation')"
    :close-disabled="view.isLoading || view.formIsDirty"
    large
    fixed-footer
    @keydown.enter="submitForm"
    @update:model-value="emit('update:show-dialog', $event)"
  >
    <BaseCard>
      <v-card-text v-if="item">
        <!-- Read only text fields -->

        <!-- Risk affected -->
        <v-label class="mt-4">{{ t('riskAffectedLabel') }}</v-label>
        <BaseCard border padding>
          <v-text-field
            :label="t('riskAffected')"
            :model-value="form?.origin?.displayName"
            disabled
            variant="underlined"
          />
        </BaseCard>

        <!-- Requirement -->
        <v-label class="mt-4">{{ t('requirement') }}</v-label>
        <BaseCard border padding>
          <v-row>
            <v-col>
              <v-text-field
                :label="t('abbreviation')"
                :model-value="form?.control?.abbreviation"
                disabled
                variant="underlined"
              />
            </v-col>

            <v-col>
              <v-text-field
                :label="t('protectionApproach')"
                :model-value="additionalInfo?.protectionApproachTranslation"
                disabled
                variant="underlined"
              />
            </v-col>
          </v-row>

          <v-text-field :label="t('name')" :model-value="form?.control?.name" disabled variant="underlined" />

          <!-- Foldable Requirement Description -->
          <v-expansion-panels>
            <v-expansion-panel>
              <template #title>
                {{ t('requirementDescription') }}
              </template>
              <template #text>
                <!-- eslint-disable-next-line vue/no-v-html -- input sanitized -->
                <div v-if="additionalInfo.requirementDescription" v-html="sanitizedDescription"></div>
                <div v-else>{{ t('noRequirementDescriptionAvailable') }}</div>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </BaseCard>

        <!-- Editable implementation details -->
        <v-label class="mt-4">{{ t('implementation') }}</v-label>

        <BaseCard border padding margin-bottom>
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

          <!-- Implementation date -->
          <!-- @click:clear
            in vuetify 3.6.xx `clearable` doesn't reset the value when clearing the input,
            thus v-model is being reset manually
        -->
          <v-date-input
            v-model="form.implementationUntil"
            :label="t('implementationUntil')"
            :placeholder="globalT('inputPlaceholders.date')"
            prepend-icon=""
            prepend-inner-icon="$calendar"
            clearable
            @click:clear="form.implementationUntil = undefined"
          >
          </v-date-input>

          <!-- Status -->
          <v-radio-group v-model="form.status" inline>
            <template #label>
              <div>{{ t('status') }}</div>
            </template>
            <template v-for="(key, value) in Status" :key="key">
              <v-radio :label="t(`statusValues.${value}`)" :value="`${key}`" />
            </template>
          </v-radio-group>

          <!-- Description -->
          <v-textarea v-model="form.implementationStatement" :label="t('description')" variant="underlined" />

          <!-- Originiation -->

          <!--
            The backend currently only knows a single origination,
            until users can actually work with this property (more than one possible origination)
            this form field should not be rendered

          <v-radio-group :model-value="form?.origination" inline>
            <template #label>
              <div>{{ t('origination') }}</div>
            </template>

            <template v-for="(key, value) in Origination" :key="key">
              <v-radio :label="t(`originationValues.${value}`)" :value="`${key}`" />
            </template>
          </v-radio-group>
          -->
        </BaseCard>
      </v-card-text>
      <ObjectFormSkeletonLoader v-else />
    </BaseCard>
    <template #dialog-options>
      <v-btn flat variant="plain" :disabled="view.isLoading" @click="emit('update:show-dialog', false)">
        {{ globalT('global.button.cancel') }}
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
              state.CTLModule.value.owner.id &&
              submitForm({
                type: state.type.value,
                riskAffected: state.CTLModule.value.owner.id as string,
                form,
                item: item,
                request
              })
            )
        "
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
import domainQueryDefinitions, {
  IVeoFetchPersonsInDomainParameters,
  IVeoPersonInDomain
} from '~/composables/api/queryDefinitions/domains';
import controlQueryDefinitions, { IVeoFetchObjectParameters } from '~/composables/api/queryDefinitions/objects';
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

import { useRequest } from '@/composables/api/utils/request';
import { IVeoObjectControlCompendiumEntry } from '~/types/VeoTypes';
import { format } from 'date-fns';
import { useDate } from 'vuetify';

import DOMPurify from 'dompurify';

const { request } = useRequest();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { getRequirementImplementationId, state } = useCompliance();
const adapter = useDate();

interface Props {
  item: RequirementImplementation | null;
  showDialog: boolean;
  locale: string;
}

interface Emits {
  (e: 'update:show-dialog', value: boolean): void;
  (e: 'update:item'): void;
}

export type RequirementImplementation = {
  origin: { displayName?: string };
  control: { id?: string; displayName?: string };
  responsible: ResponsiblePerson | null;
  status: string;
  implementationStatement?: string | null;
  origination: string;
};

type ResponsiblePerson = {
  name: string;
  targetUri: string;
};

/** Cp. comment in template above */
/*
enum Origination {
  SystemSpecific = 'SYSTEM_SPECIFIC'
  // Inherited = 'INHERITED',
  // Organisation = 'ORGANISATION'
}
*/

enum Status {
  Unknown = 'UNKNOWN',
  Yes = 'YES',
  Partial = 'PARTIAL',
  No = 'NO',
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
  origination: 'SYSTEM_SPECIFIC'
};

const form: Ref<RequirementImplementation> = ref(initialForm);

// React on changing props, e.g. if a new item is passed
const _item = computed(() => props.item);
watch(_item, () => {
  if (!_item.value) return;
  form.value = {
    ..._item.value,
    implementationUntil: _item.value.implementationUntil ? adapter.parseISO(_item.value.implementationUntil) : undefined
  };
});

// view
const view = reactive({
  isLoading: false,
  formIsDirty: false
});

// Load persons from current unit + current domain
const unitId = computed(() => route.params.unit);
const domainId = computed(() => route.params.domain);
const totalItemCount = computed(() => _personsForTotalItemCount?.value?.totalItemCount);

// Fetch to get total number of persons
const isFetchingTotalItemCount = computed(() => !!domainId.value && !!unitId.value);

const totalItemCountQueryParameters = computed<IVeoFetchPersonsInDomainParameters>(() => ({
  domainId: domainId.value as string,
  unitId: unitId.value as string,
  size: '1'
}));

const { data: _personsForTotalItemCount } = useQuery(
  domainQueryDefinitions.queries.fetchPersonsInDomain,
  totalItemCountQueryParameters,
  { enabled: isFetchingTotalItemCount.value }
);

// Fetch Control
const controlParameters = computed<IVeoFetchObjectParameters>(() => ({
  id: props.item?.control.id as string,
  domain: domainId.value,
  endpoint: 'controls'
}));
const { data: control } = useQuery(controlQueryDefinitions.queries.fetch, controlParameters, {
  enabled: computed(() => !!props.item?.control.id)
});

const additionalInfo = ref({});
const sanitizedDescription = ref<string>('');

const updateControlInfo = (control) => {
  const customAspects = control?.customAspects as IVeoObjectControlCompendiumEntry | undefined;

  if (!customAspects) return undefined;

  additionalInfo.value.requirementDescription = customAspects?.control_bpCompendium?.control_bpCompendium_content ?? '';
  additionalInfo.value.protectionApproach =
    customAspects.control_bpInformation?.control_bpInformation_protectionApproach;
};

watch(control, () => updateControlInfo(control.value), { immediate: true });

watch(
  () => additionalInfo.value.requirementDescription,
  (newDescription) => {
    sanitizedDescription.value = DOMPurify.sanitize(newDescription);
  },
  { immediate: true }
);

// Get and translate the protection approach value of the current item
const { data: translations } = useTranslations({ domain: props.domainId });

function translateProtectionApproach({ translations, locale, protectionApproach }) {
  if (!translations?.lang || !locale || !protectionApproach) return '';
  return translations.lang[locale][protectionApproach];
}

additionalInfo.value.protectionApproachTranslation = computed(() =>
  translateProtectionApproach({
    translations: translations.value,
    locale: props.locale,
    protectionApproach: additionalInfo.value.protectionApproach
  })
);

// Fetch again to get all persons in current domain + unit
const isFetchingPersons = computed(() => !!domainId.value && !!unitId.value && !!totalItemCount);

const fetchPersonsInDomainQueryParameters = computed<IVeoFetchPersonsInDomainParameters>(() => ({
  domainId: domainId.value as string,
  unitId: unitId.value as string,
  size: totalItemCount.value
}));

const { data: _persons } = useQuery(
  domainQueryDefinitions.queries.fetchPersonsInDomain,
  fetchPersonsInDomainQueryParameters,
  { enabled: isFetchingPersons.value }
);

const persons = computed(() => mapPersons(_persons?.value?.items as IVeoPersonInDomain[]));

function mapPersons(persons: IVeoPersonInDomain[]): ResponsiblePerson[] {
  return persons.map((person) => ({
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
}: {
  type: string;
  riskAffected: string;
  form: RequirementImplementation;
  item: any;
  request: any;
}) {
  if (!form) return;

  view.isLoading = true;

  // Filter out empty properties
  const _form = cloneDeep(form);

  // Format implementation date
  if (_form.implementationUntil) {
    _form.implementationUntil = format(_form.implementationUntil, 'yyyy-MM-dd');
  }

  const requirementImplementation = Object.fromEntries(Object.entries(_form).filter(([, value]) => value !== null));

  const requirementImplementationId = getRequirementImplementationId(item._self);
  const url = `/api/${type}/${riskAffected}/requirement-implementations/${requirementImplementationId}`;

  try {
    await request(url, {
      method: 'PUT',
      json: requirementImplementation,
      params: { id: requirementImplementationId }
    });
    emit('update:item');
    displaySuccessMessage(t('requirementImplementationUpdated'));
  } catch (error: any) {
    displayErrorMessage(t('requirementImplementationNotUpdated'), error.message);
  } finally {
    view.isLoading = false;
    emit('update:show-dialog', false);
  }
}
</script>

<i18n>
{
"de": {
  "requirement": "Anforderung",
  "requirementDescription": "Anforderungsbeschreibung",
  "noRequirementDescriptionAvailable": "Kein Inhalt verfügbar.",
  "riskAffected": "Zielobjekt",
  "description": "Umsetzungsbeschreibung",
  "origination": "Umsetzungsherkunft",
  "originationValues": {
    "SystemSpecific": "Systemspezifisch",
    "Inherited": "Vererbung",
    "Organisation": "Organisation"
  },
  "status": "Status",
  "statusValues": {
    "Unknown": "Unbearbeitet",
    "Yes": "Ja",
    "Partial": "Teilweise",
    "No": "Nein",
    "NA": "Entbehrlich"
  },
  "responsible": "Verantwortlich",
  "editRequirementImplementation": "Anforderung bearbeiten",
  "requirementImplementationNotUpdated": "Anforderung konnte nicht aktualisiert werden.",
  "requirementImplementationUpdated": "Anforderung wurde erfolgreich aktualisiert.",
  "name": "Name",
  "protectionApproach": "Vorgehensweise",
  "implementationUntil": "Umsetzung bis",
  "abbreviation": "Abkürzung",
  "implementation": "Umsetzung",
  "riskAffectedLabel": "Zuordnung",
},
"en": {
  "requirement": "Requirement",
  "requirementDescription": "Description",
  "noRequirementDescriptionAvailable": "No content available.",
  "riskAffected": "Target object",
  "description": "Beschreibung",
  "origination": "Herkunft",
  "originationValues": {
    "SystemSpecific": "system specific",
    "Inherited": "Inheritance",
    "Organisation": "Organization"
  },
  "status": "Status",
  "statusValues": {
    "Unknown": "unedited",
    "Yes": "yes",
    "Partial": "partial",
    "No": "no",
    "NA": "dispensable"
  },
  "responsible": "responsible",
  "editRequirementImplementation": "edit Requirement Implementation",
  "requirementImplementationNotUpdated": "Requirement Implementation could not be updated.",
  "requirementImplementationUpdated": "Requirement Implementation successfully updated.",
  "name": "Name",
  "protectionApproach": "Protection approach",
  "implementationUntil": "Implementation by",
  "abbreviation": "Abbreviation",
  "implementation": "Implementation",
  "riskAffectedLabel": "Assignment",
}
}
</i18n>
