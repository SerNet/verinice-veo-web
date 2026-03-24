<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi, Đ. Mirosavljevic
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
    v-if="items?.length"
    v-model="isOpen"
    max-width="1200"
    :title="t('importObjects.title')"
    :confirm-close="confirmCloseMessage || false"
    fixed-footer
    x-large
    scrollable
    @update:model-value="updateView"
  >
    <template #default>
      <div>
        <BaseAlert
          v-if="items.length - invalidCount > 0"
          v-model="confirmImport"
          :title="t('importObjects.validObjectsTitle')"
          :text="
            t('importObjects.confirmImport', {
              total: items.length,
              invalid: invalidCount,
              valid: items.length - invalidCount
            })
          "
          :type="VeoAlertType.WARNING"
          class="text-pre-wrap"
          no-close-button
          :buttons="importButtons()"
        />
        <v-alert v-if="invalidCount > 0 && !confirmImport" class="mb-4" :type="'error'" variant="tonal">
          <strong v-if="invalidCount > 0">
            {{ t('importObjects.invalidBeforeImport', { invalid: invalidCount, total: items.length }) }}
          </strong>
          &nbsp;<span v-if="totalItems - importedItems > 0">
            {{ t('importObjects.showingRemaining', { count: totalItems - importedItems }) }}
          </span>
        </v-alert>
      </div>
      <div>
        <v-divider v-if="unmappedRequiredFields.length > 0 && items.length" class="mt-4 mb-6" />
        <div v-else class="mb-4"></div>
        <div v-if="items.length" class="d-flex">
          <v-col cols="12" md="4">
            <v-select
              v-model="globalObjectType"
              :items="typesOptions"
              :label="t('importObjects.objectType')"
              :rules="[requiredRule]"
              outlined
              :error="!globalObjectType"
              :error-messages="!globalObjectType ? t('global.input.required') : ''"
              @update:model-value="applyType"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="globalSubType"
              :items="subTypesOptions"
              :label="t('importObjects.subType') + '*'"
              :required="true"
              outlined
              :error="!globalSubType"
              :error-messages="!globalSubType ? t('global.input.required') : ''"
              @update:model-value="applySubType"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              :label="t('importObjects.status') + ' *'"
              :error="!globalSubType"
              :error-messages="
                !globalSubType ? t('importObjects.selectSubtypeFirst')
                : !selectedStatus ? t('global.input.required')
                : ''
              "
              :disabled="!globalSubType"
            />
          </v-col>
        </div>

        <v-card-text v-if="items.length" class="px-0 py-0 mt-2">
          <div class="table-wrapper">
            <ObjectCsvTable ref="csvTableRef" :headers="localHeaders" :items="items">
              <template #headers>
                <tr>
                  <th v-for="header in headers" :key="header">
                    <v-autocomplete
                      :value="getFieldTranslation(headerMappings[header])"
                      :items="getAvailableOptions(header)"
                      dense
                      :label="getHeaderLabel(header)"
                      outlined
                      hide-details
                      clearable
                      :placeholder="t('importObjects.selectMapping')"
                      :no-data-text="t('importObjects.noOptionsAvailable')"
                      item-title="title"
                      item-value="value"
                      return-object
                      @update:model-value="(val) => updateMapping(header, val?.value)"
                    />
                  </th>
                </tr>
              </template>
              <template v-for="header in localHeaders" :key="header.value" #[`item.${header.value}`]="{ item, index }">
                <div :key="header.value" @click="startEditing(item, header.value)">
                  <v-text-field
                    v-if="editingItem === item && editingKey === header.value"
                    v-model="item[header.value]"
                    variant="underlined"
                    density="compact"
                    hide-details
                    autofocus
                    @blur="stopEditing"
                    @keydown.enter="stopEditing"
                  />
                  <span
                    v-else
                    class="cell-content"
                    :class="{
                      'error-cell': validationErrors[index]?.[headerMappings[header.value]]
                    }"
                  >
                    {{ item[header.value] || '-' }}
                  </span>
                  <div v-if="validationErrors[index]?.[headerMappings[header.value]]" class="error">
                    {{ validationErrors[index][headerMappings[header.value]] }}
                  </div>
                </div>
              </template>
            </ObjectCsvTable>
          </div>
        </v-card-text>
      </div>
    </template>
    <template #dialog-options>
      <v-btn variant="text" @click="emit('update:model-value', false)">
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="items.length"
        variant="text"
        color="primary"
        :disabled="!hasAllRequiredFields || confirmImport || items.length - invalidCount === 0"
        @click="handleImport"
      >
        {{ t('global.button.import') }}
      </v-btn>
    </template>
  </BaseDialog>
  <BaseDialog v-model="isImporting" confirm-close :title="t('importObjects.importingTitle')">
    <template #default>
      <div class="text-center py-6">
        <div class="text-h6 mb-4">{{ t('importObjects.importSuccessful') }}</div>
        <div class="text-h6 mb-4">{{ importedItems }} / {{ totalItems }}</div>
        <div class="text-subtitle-1">
          {{ t('importObjects.importedProgress', { progress }) }}
        </div>
        <v-progress-linear :model-value="progress" height="6" color="primary" class="mt-4 mb-4" />
      </div>
    </template>
    <template #dialog-options>
      <v-btn variant="text" color="primary" :disabled="!isImporting" @click="cancelImport">
        {{ t('global.button.cancel') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';
import { VeoAlertType, VeoElementTypePlurals } from '~/types/VeoTypes';
import type { IAlertButton } from '../base/Alert.vue';

interface MappedHeader {
  title: string;
  value: string;
  width?: string;
}

/** Props & Emits */
defineSlots();

interface Props {
  headers: string[];
  data: Record<string, any>[];
  requiredFields?: string[];
  preselectedType?: string;
  preselectedSubType?: string;
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  requiredFields: () => ['name'],
  preselectedType: '',
  preselectedSubType: '',
  modelValue: false
});

const emit = defineEmits<{
  (event: 'save'): void;
  (event: 'navigate', objectType: string, subType: string): void;
  (event: 'update:model-value', value: boolean): void;
}>();

const isOpen = toRef(props.modelValue);

/** Dependencies */
const { t, locale } = useI18n();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
const route = useRoute();
const { data: currentDomain } = useCurrentDomain();
const { createLink } = useCreateLink();
const { mutateAsync: create } = useMutation(objectQueryDefinitions.mutations.createObject);

/** Reactive Variables */
const items = ref<Record<string, any>[]>();
const globalObjectType = ref<string>(props.preselectedType);
const globalSubType = ref<string>(props.preselectedSubType);
const isImporting = ref<boolean>(false);
const progress = ref<number>(0);
const isCancelled = ref<boolean>(false);
const failedImports = ref<{ item: any; error: string }[]>([]);
const importedItems = ref<number>(0);
const totalItems = ref<number>(0);
const headerMappings = ref<Record<string, string>>({});
const csvTableRef = ref();
const editingItem = ref<any>(null);
const editingKey = ref<string>('');
const selectedStatus = ref<string>('');
const validationErrors = ref<Record<number, Record<string, string>>>({});
const confirmImport = ref<boolean>(false);

// Track original state for dirty check
const originalState = ref({
  headerMappings: {} as Record<string, string>,
  items: [] as Record<string, any>[],
  globalObjectType: '',
  globalSubType: '',
  selectedStatus: ''
});

/** Computed Properties */
const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain
}));

const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters);

const typesOptions = computed(() => {
  const types = Object.keys(currentDomain?.value?.raw?.elementTypeDefinitions || {});
  return types.map((key) => ({
    value: key,
    title: translations.value?.lang[locale.value]?.[key] || key
  }));
});

const subTypesOptions = computed(() => {
  const subTypes = currentDomain.value?.raw?.elementTypeDefinitions?.[globalObjectType.value]?.subTypes || {};
  return Object.keys(subTypes).map((key) => ({
    value: key,
    title:
      currentDomain.value?.raw?.elementTypeDefinitions?.[globalObjectType.value]?.translations?.[locale.value]?.[
        `${globalObjectType.value}_${key}_singular`
      ] || key
  }));
});

const statusOptions = computed(() => {
  const statuses =
    currentDomain.value?.raw?.elementTypeDefinitions?.[globalObjectType.value]?.subTypes?.[globalSubType.value]
      ?.statuses || [];

  return statuses.map((status: string) => ({
    value: status,
    title:
      currentDomain.value?.raw?.elementTypeDefinitions?.[globalObjectType.value]?.translations?.[locale.value]?.[
        `${globalObjectType.value}_${globalSubType.value}_status_${status}`
      ] ?? status
  }));
});

const customAttributes = computed(() => {
  const typeDef = currentDomain.value?.raw?.elementTypeDefinitions?.[globalObjectType.value];
  if (!typeDef) return [];
  const translations = typeDef.translations?.[locale.value] || typeDef.translations?.['de'] || {};

  return Object.entries(typeDef.customAspects || {}).flatMap(([customAspectKey, customAspectDef]: [string, any]) =>
    Object.entries(customAspectDef.attributeDefinitions || {})
      .filter(([_, attrDef]: [string, any]) => ['text', 'string'].includes(attrDef.type))
      .map(([attrKey]: [string, any]) => ({
        key: attrKey,
        title: translations[attrKey] || attrKey,
        customAspect: customAspectKey
      }))
  );
});

const unmappedRequiredFields = computed(() => props.requiredFields.filter((field) => !getMappedHeader(field)));

const standardFields = ['name', 'abbreviation', 'description'];

const objectProps = computed(() => {
  const customFields = customAttributes.value.map((attr) => attr.key);
  return [...new Set([...props.requiredFields, ...standardFields, ...customFields])];
});

// Map technical field names to user-friendly translated names
const getFieldTranslation = (technicalName: string) => {
  if (!technicalName) return '';
  const customAttr = customAttributes.value.find((a) => a.key === technicalName);
  if (customAttr && customAttr.title) {
    return customAttr.title;
  }
  return t('objectlist.' + technicalName);
};

const getHeaderLabel = (header: string) => header.replace(/__\d+$/, '');

const localHeaders = computed<MappedHeader[]>(() =>
  props.headers.map((header) => ({
    title: getHeaderLabel(header),
    value: header,
    width: '200px'
  }))
);

const hasAllRequiredFields = computed(() => {
  const usedOptions = Object.values(headerMappings.value).filter((value) => value);
  return (
    usedOptions.length >= props.requiredFields.length &&
    props.requiredFields.every((field) => usedOptions.includes(field)) &&
    usedOptions.every((option) => objectProps.value.includes(option)) &&
    !!globalObjectType.value &&
    !!globalSubType.value &&
    !!selectedStatus.value
  );
});

props.headers.forEach((header) => {
  headerMappings.value[header] = '';
});

const confirmCloseMessage = computed(() => {
  if (importedItems.value > 0) return '';

  // Check if mappings have changed
  const mappingsChanged = Object.keys(headerMappings.value).some(
    (key) => headerMappings.value[key] !== originalState.value.headerMappings[key]
  );

  // Check if items have been edited
  const itemsChanged = items.value?.some((item, index) => {
    if (index >= originalState.value.items.length) return true;
    return Object.keys(item).some((key) => item[key] !== originalState.value.items[index][key]);
  });

  // Check if type selections changed
  const typeChanged = globalObjectType.value !== originalState.value.globalObjectType;
  const subTypeChanged = globalSubType.value !== originalState.value.globalSubType;
  const statusChanged = selectedStatus.value !== originalState.value.selectedStatus;

  return mappingsChanged || itemsChanged || typeChanged || subTypeChanged || statusChanged ?
      t('importObjects.confirmClose')
    : '';
});

/** Watchers */

watchEffect(() => {
  items.value = props.data.map((item) => ({ ...item })); // Shallow copy
});

watch(globalObjectType, (newType) => {
  const firstSubType = Object.keys(currentDomain.value?.raw?.elementTypeDefinitions?.[newType]?.subTypes || {})[0];
  globalSubType.value = firstSubType || '';
});

/** Methods */

// Initialize the original state to track changes
const initializeOriginalState = () => {
  originalState.value = {
    headerMappings: JSON.parse(JSON.stringify(headerMappings.value)),
    items: items.value ? JSON.parse(JSON.stringify(items.value)) : [],
    globalObjectType: globalObjectType.value,
    globalSubType: globalSubType.value,
    selectedStatus: selectedStatus.value
  };
};
// Initialize original state when dialog opens
watch(
  isOpen,
  (newValue) => {
    if (newValue) {
      initializeOriginalState();
    }
  },
  { immediate: true }
);
// Apply global type to all items
const applyType = (value: any) => {
  items.value = items.value.map((item) => ({
    ...item,
    objectType: value
  }));
};
// Apply global subtype to all items
const applySubType = (value: any) => {
  items.value = items.value.map((item) => ({
    ...item,
    subType: value
  }));
};

const getAvailableOptions = (header: string) => {
  const usedOptions = Object.values(headerMappings.value).filter(
    (value) => value && value !== headerMappings.value[header]
  );
  return objectProps.value
    .filter((option) => !usedOptions.includes(option))
    .map((option) => ({
      value: option,
      title: getFieldTranslation(option)
    }));
};

const getMappedHeader = (requiredField: string) => {
  return Object.entries(headerMappings.value).find(([_, value]) => value === requiredField)?.[0] || '';
};

const startEditing = (item: any, key: string) => {
  editingItem.value = item;
  editingKey.value = key;
};

const stopEditing = () => {
  editingItem.value = null;
  editingKey.value = '';
};

function requiredRule(value: string) {
  return !!value || t('global.input.required').toString();
}

/** Event Handlers */
const onSubmit = async (data: any[], originalData: any[]) => {
  isImporting.value = true;
  isCancelled.value = false;
  failedImports.value = [];
  totalItems.value = data.length;
  importedItems.value = 0;

  const successfullyImported = new Set();
  // TODO: Make Batch size as Environment Variable
  const BATCH_SIZE = 5;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    if (isCancelled.value) break;

    // Get current batch slice
    const batch = data.slice(i, i + BATCH_SIZE);
    // Create array of promises for the batch
    const promises = batch.map((item, index) =>
      create({
        endpoint: VeoElementTypePlurals[globalObjectType.value as keyof typeof VeoElementTypePlurals],
        object: item
      }).catch((e) => {
        // Return error with original index
        return Promise.reject({ error: e, originalIndex: i + index });
      })
    );

    // Wait for all promises in batch to settle
    const results = await Promise.allSettled(promises);

    // Process results
    results.forEach((result, batchIndex) => {
      const originalIndex = i + batchIndex;
      if (result.status === 'fulfilled') {
        importedItems.value++;
        successfullyImported.add(data[originalIndex]);
      } else {
        const error = result.reason.error;
        console.error(`Failed to import item: ${JSON.stringify(data[originalIndex])}`, error);
        failedImports.value.push({
          item: originalData[originalIndex],
          error: error.message
        });
      }
    });

    // Update progress
    progress.value = Math.round(((importedItems.value + failedImports.value.length) / totalItems.value) * 100);
  }

  isImporting.value = false;

  // Rest of your logic remains the same
  const unmappedOrFailedItems = originalData.filter((_, index) => !successfullyImported.has(data[index]));

  items.value = items.value.filter((_, index) => validationErrors.value[index]);

  if (failedImports.value.length > 0) {
    displayErrorMessage(
      t('importObjects.importErrorMessageTitle'),
      t('importObjects.importErrorMessage', {
        imported: importedItems.value,
        total: totalItems.value,
        failed: failedImports.value.length
      })
    );
  } else if (isCancelled.value) {
    displaySuccessMessage(
      t('importObjects.importCancelled'),
      undefined,
      t('importObjects.importCancelledMessage', {
        imported: importedItems.value,
        total: totalItems.value,
        remaining: unmappedOrFailedItems.length
      })
    );
  } else {
    displaySuccessMessage(
      t('importObjects.importSuccessTitle'),
      undefined,
      t('importObjects.importSuccessMessage', {
        imported: importedItems.value,
        total: totalItems.value
      })
    );
  }
};
const invalidCount = computed(() => Object.keys(validationErrors.value || {}).length);

const validRows = computed(() => items.value?.filter((_, index) => !validationErrors.value[index]) || []);
watch(invalidCount, (count) => {
  if (count === 0) {
    confirmImport.value = false;
  }
});

const normalizeValue = (value: any) => {
  if (value === null || value === undefined) return '';
  const v = String(value).trim();
  if (v === '' || v === '-') return '';
  return value;
};

const startImport = async () => {
  const inverseMappings: Record<string, string> = Object.fromEntries(
    Object.entries(headerMappings.value)
      .filter(([_, field]) => field && objectProps.value.includes(field))
      .map(([header, field]) => [field, header])
  );

  // Transform each row in items to include only the required fields and global properties
  const transformedData = validRows.value.map((row) => {
    const newItem = {
      objectType: globalObjectType.value,
      subType: globalSubType.value,
      owner: createLink('units', route.params.unit as string),
      status: selectedStatus.value,
      customAspects: {}
    } as Record<string, any>;

    // Iterate over the inverse mappings to extract the data correctly
    Object.entries(inverseMappings).forEach(([fieldKey, csvHeader]) => {
      // If the user mapped this field AND there is data in the row
      if (csvHeader && row[csvHeader] !== undefined) {
        // Check if this is a Custom Aspect (does it exist in our computed list?)
        const customAttr = customAttributes.value.find((a) => a.key === fieldKey);

        if (customAttr) {
          if (!newItem.customAspects[customAttr.customAspect]) {
            newItem.customAspects[customAttr.customAspect] = {};
          }
          newItem.customAspects[customAttr.customAspect][fieldKey] = normalizeValue(row[csvHeader]);
        } else {
          newItem[fieldKey] = normalizeValue(row[csvHeader]);
        }
      }
    });

    // Clean up customAspects if no mapping was injected to keep payload clean
    if (Object.keys(newItem.customAspects).length === 0) {
      delete newItem.customAspects;
    }

    return newItem;
  });

  // Call onSubmit with transformed data and original data (items)
  await onSubmit(transformedData, validRows.value);
};

const cancelImport = () => {
  isCancelled.value = true; // Set the cancellation flag
  isImporting.value = false;
};

const updateMapping = (key: string, value: string | undefined) => {
  headerMappings.value[key] = value || '';
};

const updateView = (value: boolean) => {
  if (!value && importedItems.value > 0) {
    emit('navigate', globalObjectType.value, globalSubType.value);
  }
  emit('update:model-value', value);
};

function importButtons(): IAlertButton[] {
  return [
    {
      text: t('global.button.import'),
      onClick: () => {
        confirmImport.value = false;
        startImport();
      }
    }
  ];
}

const validateAll = () => {
  const mappedFields = Object.values(headerMappings.value).filter(Boolean);

  // ensure all required fields are mapped
  if (!props.requiredFields.every((f) => mappedFields.includes(f))) {
    validationErrors.value = {};
    return;
  }
  const newErrors: Record<number, Record<string, string>> = {};

  const inverseMappings: Record<string, string> = Object.fromEntries(
    Object.entries(headerMappings.value)
      .filter(([_, field]) => field)
      .map(([header, field]) => [field, header])
  );

  items.value?.forEach((row, index) => {
    const errors: Record<string, string> = {};

    Object.keys(inverseMappings).forEach((field) => {
      const csvHeader = inverseMappings[field];
      const value = csvHeader ? row[csvHeader] : undefined;

      // required field validation
      if (props.requiredFields.includes(field)) {
        if (!value || value.toString().trim() === '') {
          errors[field] = t('global.input.required');
          return;
        }
      }
      // string validation
      if (value !== null && value !== undefined && typeof value !== 'string') {
        errors[field] = t('global.input.mustBeString');
      }
    });

    if (Object.keys(errors).length > 0) {
      newErrors[index] = errors;
    }
  });

  validationErrors.value = newErrors;
};

watch(
  [items, headerMappings, globalSubType, selectedStatus],
  () => {
    validateAll();
  },
  { deep: true }
);

const handleImport = () => {
  confirmImport.value = invalidCount.value > 0;
  if (!confirmImport.value) {
    startImport();
  }
};
</script>
<i18n src="~/locales/base/components/object-csv-dialog.json"></i18n>
<style scoped>
:deep(.v-data-table__tr.highlight) {
  animation: highlight 1s forwards;
}

:deep(.v-data-table__tr.remove-highlight) {
  animation: removeHighlight 1s forwards;
}

@keyframes highlight {
  0% {
    background-color: transparent;
  }
  100% {
    background-color: #f5dfe3;
  }
}

@keyframes removeHighlight {
  0% {
    background-color: #f5dfe3;
  }
  100% {
    background-color: transparent;
  }
}

.table-wrapper {
  overflow-x: auto;
  min-width: 800px;
}

.editable-table {
  --v-table-header-height: 48px;
}

.editable-table :deep(.v-data-table__td) {
  cursor: pointer;
  min-width: 200px;
  position: relative;
  padding: 0 8px;
}

.editable-table :deep(.v-data-table__td):hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.cell-content {
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  min-height: 40px;
  line-height: 40px;
}

.v-text-field {
  margin-top: -6px;
}

.v-card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #f5f5f5;
}

.required-fields-list {
  margin-bottom: 0px;
  padding: 0px;
}

.error-cell {
  background-color: rgba(var(--v-theme-error), 0.15);
  margin-top: 2px;
  color: rgb(var(--v-theme-error));
}

.error {
  color: rgb(var(--v-theme-error));
  white-space: nowrap;
  font-size: 12px;
}

.object-side-container-select {
  flex-direction: column;
  height: auto !important;
  width: 60px;
}
</style>
