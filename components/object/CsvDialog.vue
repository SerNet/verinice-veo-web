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
      <div v-if="wizardStep === CsvImportWizardStep.MAPPING">
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
      <div v-if="wizardStep === CsvImportWizardStep.MAPPING">
        <v-alert
          v-if="unmappedRequiredFields.length > 0 && globalSubType && selectedStatus"
          class="mb-4"
          type="error"
          variant="tonal"
        >
          <span>
            {{
              t('importObjects.requiredFields', {
                required: capitalize(unmappedRequiredFields[0] || '')
              })
            }}
          </span>
        </v-alert>
        <div v-else class="mb-4"></div>
        <div v-if="items.length" class="d-flex">
          <v-col cols="12" md="4">
            <v-select
              v-model="globalObjectType"
              :items="typesOptions"
              :label="t('importObjects.objectType')"
              :rules="[requiredRule]"
              outlined
              data-veo-test="object-type-select"
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
              data-veo-test="object-subtype-select"
              :error="!globalSubType"
              :error-messages="!globalSubType ? t('global.input.required') : ''"
              @update:model-value="applySubType"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedStatus"
              data-veo-test="status-select"
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
                  <th v-for="header in headers" :key="header" class="csv-column-header">
                    <div
                      class="column-name"
                      :class="{ 'csv-column-disabled': !columnImportEnabled[header] }"
                      data-veo-test="column-name"
                    >
                      {{ getHeaderLabel(header) }}
                    </div>
                    <v-checkbox
                      :model-value="columnImportEnabled[header]"
                      :label="t('importObjects.importColumn')"
                      density="compact"
                      hide-details
                      class="my-1"
                      @update:model-value="(val) => onColumnImportToggle(header, !!val)"
                    />
                    <v-autocomplete
                      v-if="columnImportEnabled[header]"
                      v-model:search="headerSearchTerms[header]"
                      :model-value="getSelectedOption(header)"
                      :items="getAvailableOptions(header)"
                      density="compact"
                      :label="t('importObjects.targetAttribute')"
                      variant="outlined"
                      clearable
                      data-veo-test="column-mapping-select"
                      :placeholder="t('importObjects.selectMapping')"
                      :no-data-text="t('importObjects.noOptionsAvailable')"
                      item-title="title"
                      item-value="value"
                      return-object
                      :error="!headerMappings[header]"
                      :error-messages="!headerMappings[header] ? t('global.input.required') : ''"
                      @update:model-value="(val) => updateMapping(header, val?.value)"
                    />
                  </th>
                </tr>
              </template>
              <template v-for="header in localHeaders" :key="header.value" #[`item.${header.value}`]="{ item, index }">
                <div
                  class="csv-cell"
                  :class="{ 'csv-column-disabled': !columnImportEnabled[header.value] }"
                  @click="startEditing(item, header.value)"
                >
                  <v-text-field
                    v-if="columnImportEnabled[header.value] && editingItem === item && editingKey === header.value"
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
                    {{ formatCellValue(item[header.value], headerMappings[header.value]) }}
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
      <div v-else-if="wizardStep === CsvImportWizardStep.IMPORTING" class="csv-import-state">
        <div class="csv-import-state__title">{{ t('importObjects.importing') }}</div>
        <div class="csv-import-state__title">{{ importedItems }} / {{ totalItems }}</div>
        <div class="csv-import-state__subtitle">
          {{ t('importObjects.importedProgress', { progress }) }}
        </div>
        <v-progress-linear :model-value="progress" height="6" color="primary" class="csv-import-state__progress" />
      </div>
      <div v-else class="csv-import-state">
        <div class="csv-import-state__panel veo-generated-fs-group-border">
          <v-icon :icon="resultIcon" :color="resultColor" size="64" class="csv-import-state__icon" />
          <div class="csv-import-state__result-title">{{ importResultTitle }}</div>
          <div class="csv-import-state__message">{{ importResultMessage }}</div>
        </div>
      </div>
    </template>
    <template #dialog-options>
      <v-btn
        v-if="wizardStep === CsvImportWizardStep.MAPPING"
        variant="text"
        @click="emit('update:model-value', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-btn
        v-else-if="wizardStep === CsvImportWizardStep.IMPORTING"
        variant="text"
        color="primary"
        @click="cancelImport"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-btn v-else color="primary" variant="flat" @click="finishImport">
        {{ t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="wizardStep === CsvImportWizardStep.MAPPING && items.length"
        variant="text"
        color="primary"
        data-veo-test="import-button"
        :disabled="!hasAllRequiredFields || confirmImport || items.length - invalidCount === 0"
        @click="handleImport"
      >
        {{ t('global.button.import') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiCloseCircleOutline } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import type { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import { useQuery } from '~/composables/api/utils/query';
import { ELEMENT_DETAILS_CONTEXT, VeoAlertType, VeoElementTypePlurals } from '~/types/VeoTypes';
import type { CsvImportAttributeType } from '~/composables/csv/objectImport';
import {
  extractFormScopeAttributeKeys,
  extractImportableCustomAttributes,
  isBooleanCsvImportValue,
  isDateCsvImportValue,
  isDateTimeCsvImportValue,
  isEmptyCsvImportValue,
  isIntegerCsvImportValue,
  isLinkCsvImportValue,
  isValidEnumValue,
  isValidEnumListValue,
  normalizeCsvImportValue
} from '~/composables/csv/objectImport';
import type { IAlertButton } from '../base/Alert.vue';
import { capitalize } from 'vue';

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
  (event: 'close-csv-importer'): void;
  (event: 'navigate', objectType: string, subType: string): void;
  (event: 'update:model-value', value: boolean): void;
}>();

const isOpen = toRef(props.modelValue);

enum CsvImportWizardStep {
  MAPPING = 'mapping',
  IMPORTING = 'importing',
  RESULT = 'result'
}

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
const wizardStep = ref<CsvImportWizardStep>(CsvImportWizardStep.MAPPING);
const progress = ref<number>(0);
const isCancelled = ref<boolean>(false);
const failedImports = ref<{ item: any; error: string }[]>([]);
const importedItems = ref<number>(0);
const totalItems = ref<number>(0);
const headerMappings = ref<Record<string, string>>({});
const headerSearchTerms = ref<Record<string, string>>({});
const csvTableRef = ref();
const editingItem = ref<any>(null);
const editingKey = ref<string>('');
const selectedStatus = ref<string>('');
const validationErrors = ref<Record<number, Record<string, string>>>({});
const confirmImport = ref<boolean>(false);
const columnImportEnabled = ref<Record<string, boolean>>({});
const importResultType = ref<VeoAlertType>(VeoAlertType.SUCCESS);
const importResultTitle = ref('');
const importResultMessage = ref('');

const setImportResult = (type: VeoAlertType, title: string, message: string) => {
  importResultType.value = type;
  importResultTitle.value = title;
  importResultMessage.value = message;
};

// Track original state for dirty check
const originalState = ref({
  headerMappings: {} as Record<string, string>,
  items: [] as Record<string, any>[],
  globalObjectType: '',
  globalSubType: '',
  selectedStatus: '',
  columnImportEnabled: {} as Record<string, boolean>
});

/** Computed Properties */
const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain
}));

const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters);

const formsQueryParameters = computed(() => ({ domainId: route.params.domain as string }));
const formsQueryEnabled = computed(() => !!route.params.domain);
const { data: formSchemas } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, {
  enabled: formsQueryEnabled,
  placeholderData: []
});

const selectedFormSchemaId = computed(() => {
  if (!globalObjectType.value || !globalSubType.value) return undefined;
  return (formSchemas.value as IVeoFormSchemaMeta[] | undefined)?.find(
    (form) =>
      form.modelType === globalObjectType.value &&
      form.subType === globalSubType.value &&
      form.context === ELEMENT_DETAILS_CONTEXT
  )?.id;
});

const formQueryParameters = computed(() => ({ id: selectedFormSchemaId.value as string }));
const formQueryEnabled = computed(() => !!selectedFormSchemaId.value);
const { data: selectedFormSchema } = useQuery(formQueryDefinitions.queries.fetchForm, formQueryParameters, {
  enabled: formQueryEnabled
});

const subTypeAttributeKeys = computed(() => {
  if (!globalSubType.value) return new Set<string>();
  return extractFormScopeAttributeKeys(selectedFormSchema.value?.content);
});

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
  if (!typeDef || !globalSubType.value) return [];
  const translations = typeDef.translations?.[locale.value] || typeDef.translations?.['de'] || {};

  // Only keep attributes that the selected subtype's form actually uses.
  return extractImportableCustomAttributes(typeDef, translations).filter((attr) =>
    subTypeAttributeKeys.value.has(attr.key)
  );
});

const unmappedRequiredFields = computed(() => props.requiredFields.filter((field) => !getMappedHeader(field)));

const standardFields = ['name', 'abbreviation', 'description'];

const objectProps = computed(() => {
  // No subtype selected => offer no attributes at all.
  if (!globalSubType.value) return [];
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
  const allEnabledMapped = props.headers.every(
    (header) => !columnImportEnabled.value[header] || !!headerMappings.value[header]
  );
  return (
    allEnabledMapped &&
    usedOptions.length >= props.requiredFields.length &&
    props.requiredFields.every((field) => usedOptions.includes(field)) &&
    usedOptions.every((option) => objectProps.value.includes(option)) &&
    !!globalObjectType.value &&
    !!globalSubType.value &&
    !!selectedStatus.value
  );
});

const resultIcon = computed(() => {
  if (importResultType.value === VeoAlertType.SUCCESS) return mdiCheckCircleOutline;
  if (importResultType.value === VeoAlertType.WARNING) return mdiAlertCircleOutline;
  return mdiCloseCircleOutline;
});

const resultColor = computed(() => {
  if (importResultType.value === VeoAlertType.SUCCESS) return 'success';
  if (importResultType.value === VeoAlertType.WARNING) return 'warning';
  return 'error';
});

props.headers.forEach((header) => {
  headerMappings.value[header] = '';
  headerSearchTerms.value[header] = '';
  columnImportEnabled.value[header] = true;
});

const confirmCloseMessage = computed(() => {
  if (importedItems.value > 0) return '';

  // Check if mappings have changed
  const mappingsChanged = Object.keys(headerMappings.value).some(
    (key) => headerMappings.value[key] !== originalState.value.headerMappings[key]
  );
  const columnImportChanged = Object.keys(columnImportEnabled.value).some(
    (key) => columnImportEnabled.value[key] !== originalState.value.columnImportEnabled[key]
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

  return mappingsChanged || itemsChanged || typeChanged || subTypeChanged || statusChanged || columnImportChanged ?
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
    selectedStatus: selectedStatus.value,
    columnImportEnabled: JSON.parse(JSON.stringify(columnImportEnabled.value))
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

const getSelectedOption = (header: string) => {
  const mappedValue = headerMappings.value[header];
  return getAvailableOptions(header).find((option) => option.value === mappedValue) ?? null;
};

const getMappedHeader = (requiredField: string) => {
  return Object.entries(headerMappings.value).find(([_, value]) => value === requiredField)?.[0] || '';
};

const startEditing = (item: any, key: string) => {
  if (!columnImportEnabled.value[key]) return;
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
  wizardStep.value = CsvImportWizardStep.IMPORTING;
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

  items.value = items.value.filter((_, index) => validationErrors.value[index]);

  if (failedImports.value.length > 0 && importedItems.value === 0) {
    setImportResult(VeoAlertType.ERROR, t('importObjects.importFailedTitle'), t('importObjects.importFailedMessage'));
    displayErrorMessage(importResultTitle.value, importResultMessage.value);
  } else if (failedImports.value.length > 0) {
    setImportResult(
      VeoAlertType.WARNING,
      t('importObjects.importErrorMessageTitle'),
      t('importObjects.importErrorMessage', {
        imported: importedItems.value,
        total: totalItems.value,
        failed: failedImports.value.length
      })
    );
    displayErrorMessage(importResultTitle.value, importResultMessage.value);
  } else if (isCancelled.value) {
    setImportResult(
      VeoAlertType.SUCCESS,
      t('importObjects.importCancelled'),
      t('importObjects.importCancelledMessage', {
        imported: importedItems.value,
        total: totalItems.value,
        remaining: totalItems.value - importedItems.value - failedImports.value.length
      })
    );
    displaySuccessMessage(importResultTitle.value, undefined, importResultMessage.value);
  } else {
    setImportResult(
      VeoAlertType.SUCCESS,
      t('importObjects.importSuccessTitle'),
      t('importObjects.importSuccessMessage', {
        imported: importedItems.value,
        total: totalItems.value
      })
    );
    displaySuccessMessage(importResultTitle.value, undefined, importResultMessage.value);
  }

  wizardStep.value = CsvImportWizardStep.RESULT;
};
const invalidCount = computed(() => Object.keys(validationErrors.value || {}).length);

const validRows = computed(() => items.value?.filter((_, index) => !validationErrors.value[index]) || []);
watch(invalidCount, (count) => {
  if (count === 0) {
    confirmImport.value = false;
  }
});

const normalizeValue = (
  value: any,
  type?: CsvImportAttributeType,
  allowedValues?: string[],
  translations?: Record<string, string>
) => {
  if (type) {
    return normalizeCsvImportValue(value, type, allowedValues, translations).value;
  }
  return normalizeCsvImportValue(value).value;
};

const getFieldType = (fieldKey: string) =>
  customAttributes.value.find((attr) => attr.key === fieldKey)?.type ?? 'string';

const formatCellValue = (value: any, fieldKey?: string) => {
  if (isEmptyCsvImportValue(value)) return '-';

  if (fieldKey) {
    const customAttr = customAttributes.value.find((a) => a.key === fieldKey);
    if (customAttr?.type === 'enum' && translations.value?.lang[locale.value]) {
      const translated = translations.value.lang[locale.value][value];
      if (translated) return translated;
    }
  }

  return String(value);
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
      if (!csvHeader) {
        return;
      }

      // Check if this is a Custom Aspect (does it exist in our computed list?)
      const customAttr = customAttributes.value.find((a) => a.key === fieldKey);

      // Keep previous behavior for text/string fields: undefined cells are skipped entirely.
      if (row[csvHeader] === undefined && customAttr?.type !== 'boolean') {
        return;
      }

      if (customAttr) {
        const normalizedValue = normalizeCsvImportValue(
          row[csvHeader],
          customAttr.type,
          customAttr.allowedValues,
          translations.value?.lang[locale.value]
        );

        if (!normalizedValue.shouldAssign) {
          return;
        }

        if (!newItem.customAspects[customAttr.customAspect]) {
          newItem.customAspects[customAttr.customAspect] = {};
        }
        newItem.customAspects[customAttr.customAspect][fieldKey] = normalizedValue.value;
      } else {
        newItem[fieldKey] = normalizeValue(row[csvHeader]);
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
};

const finishImport = () => {
  if (importedItems.value > 0) {
    emit('navigate', globalObjectType.value, globalSubType.value);
  }
  emit('close-csv-importer');
  emit('update:model-value', false);
};

const updateMapping = (key: string, value: string | undefined) => {
  headerMappings.value[key] = value || '';
  headerSearchTerms.value[key] = value ? getFieldTranslation(value) : '';
};

const onColumnImportToggle = (header: string, enabled: boolean) => {
  columnImportEnabled.value[header] = enabled;
  if (!enabled) {
    updateMapping(header, undefined);
  }
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
        if (isEmptyCsvImportValue(value)) {
          errors[field] = t('global.input.required');
          return;
        }
      }
      const fieldType = getFieldType(field);

      if (fieldType === 'boolean') {
        if (!isBooleanCsvImportValue(value)) {
          errors[field] = t('importObjects.booleanFormat');
        }
        return;
      }
      if (fieldType === 'externalDocument') {
        if (!isLinkCsvImportValue(value)) {
          errors[field] = t('importObjects.urlFormat');
        }
        return;
      }
      if (fieldType === 'integer') {
        if (!isIntegerCsvImportValue(value)) {
          errors[field] = t('importObjects.integerFormat');
        }
        return;
      }
      if (fieldType === 'date') {
        if (!isDateCsvImportValue(value)) {
          errors[field] = t('importObjects.dateFormat');
        }
        return;
      }

      if (fieldType === 'dateTime') {
        if (!isDateTimeCsvImportValue(value)) {
          errors[field] = t('importObjects.dateTimeFormat');
        }
        return;
      }
      if (fieldType === 'enum') {
        const customAttr = customAttributes.value.find((a) => a.key === field);

        const allowedValues = customAttr?.allowedValues || [];
        if (!isValidEnumValue(value, allowedValues, translations.value.lang[locale.value])) {
          errors[field] = t('importObjects.enumSelectFormat');
        }

        return;
      }
      if (fieldType === 'enumList') {
        const customAttr = customAttributes.value.find((a) => a.key === field);

        const allowedValues = customAttr?.allowedValues || [];
        if (!isValidEnumListValue(value, allowedValues, translations.value.lang[locale.value])) {
          errors[field] = t('importObjects.enumListSelectFormat');
        }

        return;
      }
      if (!isEmptyCsvImportValue(value) && typeof value !== 'string') {
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

.cell-content {
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  min-height: 40px;
  line-height: 40px;
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

:deep(.csv-column-header) {
  vertical-align: top;
  min-width: 220px;
  padding: 8px !important;
}

.csv-column-disabled {
  opacity: 0.45;
}

.csv-cell.csv-column-disabled {
  cursor: default;
}

.csv-import-state {
  padding: 40px 0;
  text-align: center;
}

.csv-import-state__panel {
  width: min(100%, 576px);
  min-height: 260px;
  margin: 0 auto;
  padding: 64px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.csv-import-state__title {
  margin-bottom: 16px;
  font-size: 1.25rem;
  line-height: 2rem;
  font-weight: 500;
}

.csv-import-state__subtitle,
.csv-import-state__message {
  font-size: 1rem;
  line-height: 1.75rem;
}

.csv-import-state__progress {
  margin: 16px 0;
}

.csv-import-state__icon {
  margin-bottom: 24px;
}

.csv-import-state__result-title {
  margin-bottom: 16px;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 400;
}

.column-name {
  font-weight: 600;
  font-size: 0.875rem;
  padding-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
