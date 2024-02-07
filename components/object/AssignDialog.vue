<!--
   - verinice.veo web
   - Copyright (C) 2023 Frank Schneider
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation,
   - either version 3 of the License, or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program. If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BaseDialog
    :model-value="modelValue"
    v-bind="$attrs"
    :title="t('title')"
    large
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <BaseAlert
        :model-value="true"
        :title="t('domainAssignmentHintTitle')"
        :type="VeoAlertType.INFO"
        class="ma-4"
        flat
        no-close-button
      >
        {{ t('domainAssignmentHint') }}
      </BaseAlert>

      <div class="mx-4">
        <span class="text-h3 mt-8">
          {{ t('domainSelection') }}
        </span>

        <v-form v-model="formIsValid">
          <UtilProminentSelectionList
            v-model="selectedDomains"
            :items="domainProperties"
            check-box-selection-only
            multiple
          >
            <template v-for="domain of availableDomains" #[`item-${domain.id}`]>
              <div v-if="selectedDomains.includes(domain.id)" :key="domain.id">
                <v-row class="mt-2">
                  <v-col>
                    <v-select
                      :model-value="selectedSubType[domain.id]"
                      :label="`${t('subtype')}*`"
                      :items="subTypes[domain.id]"
                      required
                      :rules="[requiredRule]"
                      variant="solo-filled"
                      @click.stop
                      @update:model-value="($event: string) => onSubTypeChange($event, domain.id)"
                    />
                  </v-col>
                  <v-col>
                    <v-select
                      v-model="selectedStatus[domain.id]"
                      label="Status*"
                      :items="statuses[domain.id]"
                      :disabled="!selectedSubType[domain.id]"
                      required
                      :rules="[requiredRule]"
                      variant="solo-filled"
                      @click.stop
                      @update:model-value="($event: string) => onStatusChange($event, domain.id)"
                    />
                  </v-col>
                </v-row>
              </div>
            </template>
          </UtilProminentSelectionList>
        </v-form>
      </div>
    </template>

    <template #dialog-options>
      <v-btn variant="text" @click="emit('update:model-value', false)">
        {{ $t('global.button.cancel') }}
      </v-btn>

      <v-spacer />
      <v-btn color="primary" :disabled="!isDirty || !formIsValid" variant="text" @click="assignObject()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { isEqual } from 'lodash';

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';

import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery } from '~/composables/api/utils/query';

import { IVeoEntityLegacy, VeoAlertType } from '~/types/VeoTypes';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    objectId: string;
    objectType: string;
  }>(),
  {
    modelValue: false,
    objectId: '',
    objectType: ''
  }
);

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void;
}>();

const { t, locale } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const route = useRoute();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

const { requiredRule } = useRules();

const { data: domains } = useQuery(domainQueryDefinitions.queries.fetchDomains);
const { data: schemas } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);

const { mutateAsync: assign } = useMutation(objectQueryDefinitions.mutations.assignObject);

const selectedSubType = ref<Record<string, string | undefined>>({});
const selectedStatus = ref<Record<string, string | undefined>>({});
const selectedDomains = ref<string[]>([]);

const fetchLegacyObjectQueryParameters = computed(
  () => ({ endpoint: schemas.value?.[props.objectType], id: props.objectId }) as any
);

const formIsValid = ref(undefined);

const { data: legacyObject } = useQuery(objectQueryDefinitions.queries.fetchLegacy, fetchLegacyObjectQueryParameters, {
  onSuccess: (data: any) => {
    selectedDomains.value = Object.keys(data.domains || {});
    prePolluteList(data);
  }
});

const isDirty = computed(() => !isEqual(Object.keys(legacyObject.value?.domains || {}), selectedDomains.value));
const prePolluteList = (data: IVeoEntityLegacy) => {
  selectedSubType.value = Object.fromEntries(Object.entries(data.domains).map(([id, domain]) => [id, domain.subType]));
  selectedStatus.value = Object.fromEntries(Object.entries(data.domains).map(([id, domain]) => [id, domain.status]));
};

const subTypes = computed(() =>
  (domains.value || []).reduce(
    (prevValue, currentValue) => {
      prevValue[currentValue.id] = Object.keys(
        currentValue.elementTypeDefinitions?.[props.objectType]?.subTypes || {}
      ).map((subType) => ({
        title:
          currentValue.elementTypeDefinitions[props.objectType].translations[locale.value][
            `${props.objectType}_${subType}_singular`
          ],
        value: subType
      }));

      return prevValue;
    },
    {} as Record<string, { title: string; value: string }[]>
  )
);

const statuses = computed(() =>
  (domains.value || []).reduce(
    (prevValue, currentValue) => {
      if (!selectedSubType.value[currentValue.id]) {
        return prevValue;
      }
      prevValue[currentValue.id] = currentValue.elementTypeDefinitions[props.objectType].subTypes[
        selectedSubType.value[currentValue.id]
      ].statuses.map((status: any) => ({
        title:
          currentValue.elementTypeDefinitions[props.objectType].translations[locale.value][
            `${props.objectType}_${selectedSubType.value[currentValue.id]}_status_${status}`
          ],
        value: status
      }));

      return prevValue;
    },
    {} as Record<string, { title: string; value: string }[]>
  )
);

const onSubTypeChange = (newValue: string, domainId: string) => {
  selectedSubType.value[domainId] = newValue;
  selectedStatus.value[domainId] = undefined;
};

const onStatusChange = (newValue: string, domainId: string) => {
  selectedStatus.value[domainId] = newValue;
};

const availableDomains = computed(
  () =>
    domains.value?.map((domain) => ({
      abbreviation: domain.abbreviation,
      description: domain.description,
      id: domain.id,
      name: domain.name
    })) ?? []
);

const disabledDomains = computed(() => Object.keys(legacyObject.value?.domains || {}));

const domainProperties = computed(() =>
  availableDomains.value.map((domain) => {
    return {
      title: domain.name,
      subtitle: domain.description,
      value: domain.id,
      disabled: disabledDomains.value.includes(domain.id)
    };
  })
);

const assignObject = async () => {
  try {
    for (const domain of selectedDomains.value.filter((domain) => !disabledDomains.value.includes(domain))) {
      await assign({
        domain: domain,
        endpoint: route.params?.objectType,
        objectId: props.objectId,
        subType: selectedSubType.value[domain],
        status: selectedStatus.value[domain]
      });
      disabledDomains.value.push(domain);
    }
    displaySuccessMessage(t('objectAssigned').toString());
  } catch (error: any) {
    displayErrorMessage(t('assignmentFailed').toString(), error.message);
  } finally {
    emit('update:model-value', false);
  }
};

watch(
  () => props.modelValue,
  () => {
    selectedSubType.value = {};
    selectedStatus.value = {};

    if (legacyObject.value) {
      prePolluteList(legacyObject.value);
    }
  }
);
</script>

<i18n>
{
  "en": {
    "assignmentFailed": "The object could not be assigned to another domain.",
    "domainAssignmentHint": "Assigning an object to a further domain cannot be reversed!",
    "domainAssignmentHintTitle": "Domain assignment",
    "domainSelection": "Domain selection",
    "objectAssigned": "The object has been assigned to another domain successfully.",
    "subtype": "Subtype",
    "title": "Assign object"
  },
  "de": {
    "assignmentFailed": "Das Objekt konnte keiner weiteren Domäne zugewiesen werden.",
    "domainAssignmentHint": "Die Zuweisung eines Objektes zu einer weiteren Domäne kann nicht wieder rückgängig gemacht werden!",
    "domainAssignmentHintTitle": "Domänenzuordnung",
    "domainSelection": "Domänenauswahl",
    "objectAssigned": "Das Objekt wurde einer weiteren Domäne erfolgreich zugewiesen.",
    "subtype": "Subtyp",
    "title": "Objekt zuordnen"
  }
}
</i18n>
