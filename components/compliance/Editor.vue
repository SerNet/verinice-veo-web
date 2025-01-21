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
    data-veo-test="compliance-editor"
    @keydown.enter="submitForm"
    @update:model-value="emit('update:show-dialog', $event)"
  >
    <BaseCard>
      <v-card-text v-if="!item || view.isLoading">
        <v-skeleton-loader class="mb-4" type="list-item-two-line" />
        <v-skeleton-loader class="mb-4" type="paragraph" />
        <v-skeleton-loader class="mb-4" type="article" />
      </v-card-text>

      <v-card-text v-if="item && !view.isLoading">
        <!-- Read only text fields -->

        <!-- Target object  -->
        <v-label class="mt-4">{{ t('targetObject') }}</v-label>
        <BaseCard border padding>
          <ComplianceEditorRiMetaData
            v-for="property in config.riEditor.renderedProperties.targetObject"
            :key="property.key"
            :property="property"
            :data="form.origin"
            :additional-info="additionalInfo"
          />
        </BaseCard>

        <!-- Control -->
        <v-label class="mt-4">{{ ciSubType }}</v-label>
        <BaseCard border padding>
          <ComplianceEditorRiMetaData
            v-for="property in config.riEditor.renderedProperties.control"
            :key="property.key"
            :property="property"
            :data="form.control"
            :additional-info="additionalInfo"
          />
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
            data-veo-test="compliance-editor-ri-responsible-person"
          />

          <!-- Implementation date -->
          <!-- @click:clear
            in vuetify 3.6.xx `clearable` doesn't reset the value when clearing the input,
            thus v-model is being reset manually
        -->
          <v-date-input
            v-model="form.implementationUntil"
            :label="t('implementationUntil')"
            :placeholder="t('inputPlaceholders.date')"
            data-veo-test="compliance-editor-ri-implementation-date"
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
              <v-radio
                :label="t(`statusValues.${value}`)"
                :value="`${key}`"
                :data-veo-test="`compliance-editor-staus-${value}`"
              />
            </template>
          </v-radio-group>

          <!-- Description -->
          <v-textarea
            v-model="form.implementationStatement"
            :label="t('description')"
            variant="underlined"
            data-veo-test="compliance-editor-description"
          />
        </BaseCard>
      </v-card-text>
      <ObjectFormSkeletonLoader v-else />
    </BaseCard>
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
import { cloneDeep } from 'lodash';
import domainQueryDefinitions, {
  IVeoFetchPersonsInDomainParameters,
  IVeoPersonInDomain
} from '~/composables/api/queryDefinitions/domains';
import controlQueryDefinitions, { IVeoFetchObjectParameters } from '~/composables/api/queryDefinitions/objects';
import { useQuery } from '~/composables/api/utils/query';
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

import { useRequest } from '@/composables/api/utils/request';
import { format } from 'date-fns';
import { useDate } from 'vuetify';
import type { IVeoLink, IVeoEntity, RequirementImplementation, ResponsiblePerson } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

import type { ComputedRef, Ref } from 'vue';
import { isVeoLink, validateType } from '~/types/utils';

const { data: config } = useConfiguration();

const { request } = useRequest();
const { t } = useVeoI18n();
const adapter = useDate();
const route = useRoute();
const { updateItem } = useRequirementImplementationQuery();

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

enum Status {
  Unknown = 'UNKNOWN',
  Yes = 'YES',
  Partial = 'PARTIAL',
  No = 'NO',
  NA = 'N_A'
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/** STATE */
// data
const initialForm: RequirementImplementationForForm = {
  origin: {},
  control: {},
  responsible: null,
  status: 'UNKNOWN',
  implementationStatement: null,
  origination: 'SYSTEM_SPECIFIC'
};

const form = ref<RequirementImplementationForForm>(initialForm);

// React on changing props, e.g. if a new item is passed
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

// view
const view = reactive({
  isLoading: false,
  formIsDirty: false
});

// Load persons from current unit + current domain
const unitId = computed(() => route.params.unit);
const currentDomainId = computed(() => route.params.domain);
const totalItemCount = computed(() => _personsForTotalItemCount?.value?.totalItemCount);

// Fetch to get total number of persons
const isFetchingTotalItemCount = computed(() => !!currentDomainId.value && !!unitId.value);

const totalItemCountQueryParameters = computed<IVeoFetchPersonsInDomainParameters>(() => ({
  domainId: currentDomainId.value as string,
  unitId: unitId.value as string,
  size: '1'
}));

const { data: _personsForTotalItemCount } = useQuery(
  domainQueryDefinitions.queries.fetchPersonsInDomain,
  totalItemCountQueryParameters,
  { enabled: isFetchingTotalItemCount.value }
);

// Fetch targetObject
const targetObjectParameters = computed<IVeoFetchObjectParameters>(() => ({
  id: props.item?.origin.id as string,
  domain: currentDomainId.value as string,
  endpoint: VeoElementTypePlurals[props.item?.origin.type]
}));
const { data: targetObject } = useQuery(controlQueryDefinitions.queries.fetch, targetObjectParameters, {
  enabled: computed(() => !!props.item?.control.id)
});

// Fetch Control
const controlParameters = computed<IVeoFetchObjectParameters>(() => ({
  id: props.item?.control.id as string,
  domain: currentDomainId.value as string,
  endpoint: 'controls'
}));
const { data: control } = useQuery(controlQueryDefinitions.queries.fetch, controlParameters, {
  enabled: computed(() => !!props.item?.control.id)
});

// Translate the current item's `protection approach`
const { data: translations } = useTranslations({ domain: currentDomainId.value });

function translateProtectionApproach({ translations, locale, protectionApproach }): string {
  if (!translations?.lang || !locale || !protectionApproach) return '';
  return translations.lang[locale][protectionApproach];
}

// @ts-ignore TODO #3066 ComputedRef<string> is not assignable to type string
const protectionApproachTranslation = computed(() =>
  translateProtectionApproach({
    translations: translations.value,
    locale: props.locale,
    protectionApproach: additionalInfo.value.protectionApproach
  })
);

/**
 * Information to be shown as meta data
 * It does not come whith `props.item` and thus has to be fetched
 * You will not need it to PUT a requirement implementation
 * -> It is solely for the purpose of displaying informative data to users
 * That is why we write it into a separate variable
 */
export type TAdditionalInfo = {
  originationDescription?: string;
  protectionApproach?: string;
  targetObjectDescription?: string;
  protectionApproachTranslation?: string;
};
const additionalInfo = ref<TAdditionalInfo>({});

const updateAdditionalInfo = (control: IVeoEntity, targetObject: IVeoEntity, protectionApproachTranslation: string) => {
  // Target object
  additionalInfo.value.targetObjectDescription = targetObject?.description;

  // Control
  const customAspects = control?.customAspects;
  if (!customAspects) return;

  additionalInfo.value.originationDescription =
    customAspects?.control_bpCompendium?.control_bpCompendium_content ?? control?.description ?? '';
  additionalInfo.value.protectionApproach =
    customAspects?.['control_bpInformation']?.control_bpInformation_protectionApproach;
  additionalInfo.value.protectionApproachTranslation = protectionApproachTranslation;
};

watch(
  [control, targetObject, protectionApproachTranslation],
  () => updateAdditionalInfo(control.value, targetObject.value, protectionApproachTranslation.value),
  { immediate: true }
);

const { subTypeTranslation: ciSubType } = useSubTypeTranslation(
  toRef(() => control.value?.type),
  toRef(() => control.value?.subType),
  false
);

// Fetch again to get all persons in current domain + unit
const isFetchingPersons = computed(() => !!currentDomainId.value && !!unitId.value && !!totalItemCount);

const fetchPersonsInDomainQueryParameters = computed<IVeoFetchPersonsInDomainParameters>(() => ({
  domainId: currentDomainId.value as string,
  unitId: unitId.value as string,
  size: totalItemCount.value
}));

const { data: _persons } = useQuery(
  domainQueryDefinitions.queries.fetchPersonsInDomain,
  fetchPersonsInDomainQueryParameters,
  { enabled: isFetchingPersons.value }
);

const persons = computed(() => mapPersons(_persons?.value?.items as IVeoPersonInDomain[]) ?? []);

function mapPersons(persons: IVeoPersonInDomain[]): ResponsiblePerson[] {
  if (!persons) return [];
  return persons.map((person) => ({
    name: person.name,
    targetUri: person._self
  }));
}

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
    displaySuccessMessage(t('requirementImplementationUpdated'));
  } catch (error: any) {
    displayErrorMessage(t('requirementImplementationNotUpdated'), error.message);
  } finally {
    view.isLoading = false;
    emit('update:show-dialog', false);
  }
}
</script>

<i18n src="~/locales/base/components/compliance-editor.json"></i18n>
