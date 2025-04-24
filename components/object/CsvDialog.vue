<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi
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
    v-model="isOpen"
    max-width="1200"
    :title="$t('importObjects.title')"
    :confirm-close="confirmCloseMessage || false"
    fixed-footer
    x-large
    scrollable
    @update:model-value="updateView"
  >
    <template #default>
      <div>
        <div>
          <v-list v-if="unmappedRequiredFields.length > 0 && items.length" class="required-fields-list">
            <v-list-item>
              <v-list-item-title>
                <span class="text-error">
                  <v-icon :icon="mdiAlert"></v-icon>
                  {{ $t('importObjects.requiredFieldsNotMapped') }}
                </span>
                <span> {{ unmappedRequiredFields.join(', ') }}</span>
              </v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider v-if="unmappedRequiredFields.length > 0 && items.length" class="mt-4 mb-6" />
          <div v-else class="mb-4"></div>
          <div v-if="items.length" class="global-selection">
            <v-select
              v-model="globalObjectType"
              :items="typesOptions"
              :label="$t('importObjects.objectType')"
              :rules="[requiredRule]"
              outlined
              class="mr-2"
              style="width: 240px"
              :error="!globalObjectType"
              :error-messages="!globalObjectType ? globalT('global.input.required') : ''"
              @update:model-value="applyType"
            />
            <v-select
              v-model="globalSubType"
              :items="subTypesOptions"
              :label="$t('importObjects.subType') + '*'"
              :required="true"
              outlined
              style="width: 200px"
              :error="!globalSubType"
              :error-messages="!globalSubType ? globalT('global.input.required') : ''"
              @update:model-value="applySubType"
            />
          </div>
          <v-alert
            v-if="importedItems > 0"
            class="mb-4"
            :type="failedImports.length > 0 ? 'error' : 'success'"
            variant="tonal"
          >
            <strong v-if="failedImports.length > 0">
              {{ $t('importObjects.importCompletedWithErrors', { imported: importedItems, total: totalItems }) }}
            </strong>
            <strong v-else>
              {{ $t('importObjects.importSuccessful', { imported: importedItems, total: totalItems }) }}
            </strong>

            <span v-if="totalItems - importedItems > 0">
              {{ $t('importObjects.showingRemaining', { count: totalItems - importedItems }) }}
            </span>

            <v-btn v-if="failedImports.length > 0" small class="mb-1 ml-1" @click="toggleAndHighlight">
              {{ $t('importObjects.showFailedItems', { count: failedImports.length }) }}
            </v-btn>

            <v-expand-transition>
              <div v-if="showFailedItems">
                <ul>
                  <li v-for="(error, index) in failedImports" :key="index">
                    <strong>{{ error.item }}</strong
                    >: {{ error.error }}
                  </li>
                </ul>
              </div>
            </v-expand-transition>
          </v-alert>

          <v-card-text v-if="items.length" class="px-0 py-0 mt-2">
            <div class="table-wrapper">
              <objectCsvTable ref="csvTableRef" :headers="localHeaders" :items="items">
                <template #headers>
                  <tr>
                    <th v-for="header in headers" :key="header">
                      <v-autocomplete
                        :value="headerMappings[header]"
                        :items="getAvailableOptions(header)"
                        dense
                        :label="header"
                        outlined
                        hide-details
                        clearable
                        :placeholder="$t('importObjects.selectMapping')"
                        @update:model-value="updateMapping(header, $event)"
                      />
                    </th>
                  </tr>
                </template>
                <template v-for="header in localHeaders" :key="header.value" #[`item.${header.value}`]="{ item }">
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
                    <span v-else class="cell-content">
                      {{ item[header.value] || '-' }}
                    </span>
                  </div>
                </template>
              </objectCsvTable>
            </div>
          </v-card-text>
        </div>
      </div>
    </template>
    <template #dialog-options>
      <v-btn variant="text" @click="emit('update:model-value', false)">
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn v-if="items.length" variant="text" color="primary" :disabled="!hasAllRequiredFields" @click="handleImport">
        {{ globalT('global.button.import') }}
      </v-btn>
    </template>
  </BaseDialog>
  <BaseDialog v-model="isImporting" confirm-close :title="$t('importObjects.importingTitle')">
    <template #default>
      <div class="text-center py-6">
        <div class="text-h6 mb-4">{{ $t('importObjects.importing') }}</div>
        <div class="text-h6 mb-4">{{ importedItems }} / {{ totalItems }}</div>
        <div class="text-subtitle-1">
          {{ $t('importObjects.importedProgress', { progress }) }}
        </div>
        <v-progress-linear :model-value="progress" height="6" color="primary" class="mt-4 mb-4" />
      </div>
    </template>
    <template #dialog-options>
      <v-btn variant="text" color="primary" :disabled="!isImporting" @click="cancelImport">
        {{ globalT('global.button.cancel') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { mdiAlert } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

interface MappedHeader {
  title: string;
  value: string;
  width?: string;
}

/** Props & Emits **/
defineSlots();
const props = defineProps({
  headers: { type: Array as () => string[], required: true },
  data: { type: Array as () => Record<string, any>[], required: true },
  requiredFields: { type: Array as () => string[], default: () => ['name'] },
  preselectedType: { type: String, default: '' },
  preselectedSubType: { type: String, default: '' },
  modelValue: { type: Boolean, default: false }
});

const emit = defineEmits<{
  (event: 'save'): void;
  (event: 'navigate', objectType: string, subType: string): void;
  (event: 'update:model-value', value: boolean): void;
}>();

const isOpen = toRef(props.modelValue);

/** Dependencies **/
const { t: globalT, t: $t, locale } = useI18n();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
const route = useRoute();
const { data: currentDomain } = useCurrentDomain();
const { createLink } = useCreateLink();
const { mutateAsync: create } = useMutation(objectQueryDefinitions.mutations.createObject);

/** Reactive Variables **/
const items = ref<Record<string, any>[]>();
const globalObjectType = ref<string>(props.preselectedType);
const globalSubType = ref<string>(props.preselectedSubType);
const isImporting = ref<boolean>(false);
const progress = ref<number>(0);
const isCancelled = ref<boolean>(false);
const failedImports = ref<{ item: any; error: string }[]>([]);
const importedItems = ref<number>(0);
const totalItems = ref<number>(0);
const showFailedItems = ref<boolean>(false);
const headerMappings = ref<Record<string, string>>({});
const csvTableRef = ref();
const editingItem = ref<any>(null);
const editingKey = ref<string>('');

// Track original state for dirty check
const originalState = ref({
  headerMappings: {} as Record<string, string>,
  items: [] as Record<string, any>[],
  globalObjectType: '',
  globalSubType: ''
});

/** Computed Properties **/
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

const unmappedRequiredFields = computed(() => props.requiredFields.filter((field) => !getMappedHeader(field)));

const objectProps = computed(() => [...props.requiredFields, 'abbreviation', 'description']);

const localHeaders = computed<MappedHeader[]>(() =>
  props.headers.map((header) => ({
    title: header,
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
    !!globalSubType.value
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

  return mappingsChanged || itemsChanged || typeChanged || subTypeChanged ? $t('importObjects.confirmClose') : '';
});

/** Watchers **/

watchEffect(() => {
  items.value = props.data.map((item) => ({ ...item })); // Shallow copy
});

watch(globalObjectType, (newType) => {
  const firstSubType = Object.keys(currentDomain.value?.raw?.elementTypeDefinitions?.[newType]?.subTypes || {})[0];
  globalSubType.value = firstSubType || '';
});

/** Methods **/

// Initialize the original state to track changes
const initializeOriginalState = () => {
  originalState.value = {
    headerMappings: JSON.parse(JSON.stringify(headerMappings.value)),
    items: items.value ? JSON.parse(JSON.stringify(items.value)) : [],
    globalObjectType: globalObjectType.value,
    globalSubType: globalSubType.value
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
  const usedOptions = Object.values(headerMappings.value)
    .filter((value) => value)
    .filter((value) => value !== headerMappings.value[header]);
  return objectProps.value.filter((option) => !usedOptions.includes(option));
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
  return !!value || $t('global.input.required').toString();
}

/** Event Handlers **/
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

  items.value = [...unmappedOrFailedItems];

  if (failedImports.value.length > 0) {
    displayErrorMessage(
      `Import completed with errors.`,
      `${importedItems.value}/${totalItems.value} items were imported successfully.\nFailed items: ${failedImports.value.length}`
    );
  } else if (isCancelled.value) {
    displaySuccessMessage(
      `Import cancelled.`,
      undefined,
      `${importedItems.value}/${totalItems.value} items were imported successfully.\nRemaining items: ${unmappedOrFailedItems.length}`
    );
  } else {
    displaySuccessMessage(
      `Import Successful.`,
      undefined,
      `${importedItems.value}/${totalItems.value} items were imported successfully.`
    );
    emit('navigate', globalObjectType.value, globalSubType.value);
  }
};

const handleImport = async () => {
  const inverseMappings: Record<string, string> = Object.fromEntries(
    Object.entries(headerMappings.value)
      .filter(([_, field]) => field && objectProps.value.includes(field))
      .map(([header, field]) => [field, header])
  );

  // Transform each row in items to include only the required fields and global properties
  const transformedData = items.value.map((row) => {
    const newItem = {
      objectType: globalObjectType.value,
      subType: globalSubType.value,
      owner: createLink('units', route.params.unit as string),
      status:
        currentDomain.value?.raw?.elementTypeDefinitions?.[globalObjectType.value]?.subTypes?.[globalSubType.value]
          ?.statuses?.[0]
    } as Record<string, any>;

    // Assign values from mapped CSV headers to corresponding required fields
    objectProps.value.forEach((field) => {
      newItem[field] = row[inverseMappings[field]];
    });

    return newItem;
  });
  transformedData[2].status = 'fewd';
  // Call onSubmit with transformed data and original data (items)
  onSubmit(transformedData, items.value);
};

const cancelImport = () => {
  isCancelled.value = true; // Set the cancellation flag
  isImporting.value = false;
};

const updateMapping = (key: string, value: string) => {
  headerMappings.value[key] = value;
};

const updateView = (value: boolean) => {
  if (!value) {
    if (importedItems.value > 0) {
      emit('navigate', globalObjectType.value, globalSubType.value);
    } else {
      emit('update:model-value', false);
    }
  }
  emit('update:model-value', value);
};

// Add some design because why not
function highlightAllFailedItems(highlight: boolean) {
  nextTick(() => {
    const tableEl = csvTableRef.value?.$el;
    if (!tableEl) return;
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');

    failedImports.value.forEach((error) => {
      const index = items.value.findIndex((item) => item === error.item);
      if (index === -1 || index >= rows.length) return;
      const rowEl = rows[index];

      if (highlight) {
        rowEl.classList.add('highlight');
        rowEl.classList.remove('remove-highlight');
      } else {
        rowEl.classList.add('remove-highlight');
        rowEl.classList.remove('highlight');
      }
    });
  });
}

function toggleAndHighlight() {
  showFailedItems.value = !showFailedItems.value;
  if (showFailedItems.value) {
    highlightAllFailedItems(true);
  } else {
    highlightAllFailedItems(false);
  }
}
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

.global-selection {
  display: flex;
  gap: 16px;
  align-items: center;
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
  background-color: #f8f8f8;
}

.error-text {
  color: red;
}
.object-side-container-select {
  flex-direction: column;
  height: auto !important;
  width: 60px;
}
</style>
