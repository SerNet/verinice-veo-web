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
    :title="dialogTitle"
    heading-level="h2"
    large
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <BaseAlert :model-value="true" :title="alertTitle" :type="VeoAlertType.INFO" class="ma-4" flat no-close-button>
        {{ alertMessage }}
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
                      data-veo-test="subtype-select"
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
                      data-veo-test="status-select"
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

import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery } from '~/composables/api/utils/query';

import { IVeoEntity, IVeoEntityLegacy, VeoAlertType, VeoElementTypePlurals } from '~/types/VeoTypes';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    // Objects array (single item for single mode, multiple for bulk)
    objects?: IVeoEntity[];
  }>(),
  {
    modelValue: false,
    objects: () => []
  }
);

// Core computed properties
const isBulkMode = computed(() => props.objects.length > 1);

// In single mode we always have exactly one object in the array
const singleObject = computed(() => (isBulkMode.value ? null : props.objects[0]));

// Extracted object properties from the first/single object
const objectId = computed(() => singleObject.value?.id || props.objects[0]?.id || '');
const objectName = computed(() => singleObject.value?.name || props.objects[0]?.name || '');
const effectiveObjectType = computed(() => singleObject.value?.type || props.objects[0]?.type || '');

const dialogTitle = computed(() => {
  if (!isBulkMode.value) {
    return t('title', { object: objectName.value });
  }

  return props.objects.length > 1 ?
      t('titleBulk', { count: props.objects.length })
    : t('titleBulkSingle', { object: props.objects[0]?.name });
});

const alertTitle = computed(() => {
  if (!isBulkMode.value) {
    return t('domainAssignmentHintTitle');
  }

  return props.objects.length > 1 ? t('bulkDomainAssignmentHintTitle') : t('bulkDomainAssignmentHintTitleSingle');
});

const alertMessage = computed(() => {
  if (!isBulkMode.value) {
    return t('domainAssignmentHint');
  }

  return props.objects.length > 1 ?
      t('bulkDomainAssignmentHint', { count: props.objects.length })
    : t('bulkDomainAssignmentHintSingle', { object: props.objects[0]?.name });
});

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void;
}>();

const { t, locale } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const route = useRoute();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

const { requiredRule } = useRules();

const { data: domains } = useQuery(domainQueryDefinitions.queries.fetchDomains);

const { mutateAsync: assign } = useMutation(objectQueryDefinitions.mutations.assignObject);

const selectedSubType = ref<Record<string, string | undefined>>({});
const selectedStatus = ref<Record<string, string | undefined>>({});
const selectedDomains = ref<string[]>([]);

const schemaParametersEnabled = computed(() => !!objectId.value);
const fetchLegacyObjectQueryParameters = computed(
  () => ({ endpoint: VeoElementTypePlurals[effectiveObjectType.value], id: objectId.value }) as any
);

const formIsValid = ref(undefined);

const { data: legacyObject } = useQuery(objectQueryDefinitions.queries.fetchLegacy, fetchLegacyObjectQueryParameters, {
  onSuccess: (data: any) => {
    if (!isBulkMode.value) {
      selectedDomains.value = Object.keys(data.domains || {});
      prePolluteList(data);
    }
  },
  enabled: schemaParametersEnabled && !isBulkMode.value
});

const isDirty = computed(() => {
  if (isBulkMode.value) {
    return selectedDomains.value.length > 0;
  }
  return !isEqual(Object.keys(legacyObject.value?.domains || {}), selectedDomains.value);
});
const prePolluteList = (data: IVeoEntityLegacy) => {
  selectedSubType.value = Object.fromEntries(Object.entries(data.domains).map(([id, domain]) => [id, domain.subType]));
  selectedStatus.value = Object.fromEntries(Object.entries(data.domains).map(([id, domain]) => [id, domain.status]));
};

const subTypes = computed(() =>
  (domains.value || []).reduce(
    (prevValue, currentValue) => {
      prevValue[currentValue.id] = Object.keys(
        currentValue.elementTypeDefinitions?.[effectiveObjectType.value]?.subTypes || {}
      ).map((subType) => ({
        title:
          currentValue.elementTypeDefinitions[effectiveObjectType.value].translations[locale.value][
            `${effectiveObjectType.value}_${subType}_singular`
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
      prevValue[currentValue.id] = currentValue.elementTypeDefinitions[effectiveObjectType.value].subTypes[
        selectedSubType.value[currentValue.id]
      ].statuses.map((status: any) => ({
        title:
          currentValue.elementTypeDefinitions[effectiveObjectType.value].translations[locale.value][
            `${effectiveObjectType.value}_${selectedSubType.value[currentValue.id]}_status_${status}`
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
      abbreviation: domain?.translations?.[locale.value].abbreviation,
      description: domain?.translations?.[locale.value].description,
      id: domain.id,
      name: domain?.translations?.[locale.value].name || domain?.name
    })) ?? []
);

/**
 * List of domains that should be disabled in the UI
 * In bulk mode, no domains are disabled
 * In single mode, domains that already have the object are disabled
 */
const disabledDomains = computed(() => {
  if (isBulkMode.value) {
    return [];
  }
  return Object.keys(legacyObject.value?.domains || {});
});

/**
 * Properties for domain selection list
 */
const domainProperties = computed(() =>
  availableDomains.value.map((domain) => {
    return {
      title: domain.name,
      subtitle: domain.description,
      value: domain.id,
      disabled: !isBulkMode.value && disabledDomains.value.includes(domain.id)
    };
  })
);

/**
 * Assign a single object to a domain
 */
const assignSingleObject = async (domain: string, objectId: string, endpoint?: string) => {
  const payload = {
    domain: domain,
    endpoint: endpoint || route.params?.objectType || VeoElementTypePlurals[effectiveObjectType.value],
    objectId: objectId,
    subType: selectedSubType.value[domain],
    status: selectedStatus.value[domain]
  };

  await assign(payload);
  disabledDomains.value.push(domain);
};

/**
 * Main assign function - handles both single and bulk operations
 */
const assignObject = async () => {
  try {
    if (isBulkMode.value) {
      let assignedCount = 0;

      for (const domain of selectedDomains.value) {
        for (const object of props.objects) {
          try {
            await assignSingleObject(domain, object.id, VeoElementTypePlurals[object.type]);
            assignedCount++;
          } catch (err) {
            console.error(`Failed to assign object ${object.name} to domain ${domain}:`, err);
          }
        }
      }

      displaySuccessMessage(
        assignedCount === 0 ?
          props.objects.length === 1 ?
            t('objectAlreadyAssigned').toString()
          : t('objectsAlreadyAssigned').toString()
        : t('objectsBulkAssigned', { count: assignedCount }).toString()
      );
    } else {
      // Single object assign - only assign to domains not already assigned
      const unassignedDomains = selectedDomains.value.filter((domain) => !disabledDomains.value.includes(domain));

      for (const domain of unassignedDomains) {
        await assignSingleObject(domain, objectId.value);
      }

      displaySuccessMessage(t('objectAssigned').toString());
    }
  } catch (error: any) {
    displayErrorMessage(t('assignmentFailed').toString(), error.message);
  } finally {
    emit('update:model-value', false);
  }
};

/**
 * Reset form state when dialog opens
 */
watch(
  () => props.modelValue,
  () => {
    selectedSubType.value = {};
    selectedStatus.value = {};
    selectedDomains.value = [];

    if (isBulkMode.value) {
      // For bulk assign, start with empty selections
      return;
    }

    // For single object assignment, populate with existing domains
    if (legacyObject.value) {
      prePolluteList(legacyObject.value);
    }
  }
);
</script>

<i18n src="~/locales/base/components/object-assign-dialog.json"></i18n>
