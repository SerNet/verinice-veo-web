<!--
   - verinice.veo web
   - Copyright (C) 2026 Aziz Khalledi
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BaseDialog
    :model-value="modelValue"
    v-bind="$attrs"
    large
    :title="dialogTitle"
    :close-disabled="isSaving"
    :confirm-close="hasUnsavedChanges"
    fixed-footer
    data-veo-test="unified-object-dialog"
    @after-leave="resetDialogState"
    @update:model-value="handleDialogClose"
  >
    <template #default>
      <!-- Main View: Select Existing Objects -->
      <template v-if="!isCreatingNewObject">
        <ObjectFilterBar
          :domain-id="domainId"
          :disabled-fields="disabledFields"
          :filter="objectFilter"
          :available-object-types="availableObjectTypes"
          :required-fields="['objectType']"
          @update:filter="updateObjectFilter"
        />

        <SearchBar v-model:search="searchQueries" class="mt-2" />

        <BaseCard class="mt-3">
          <ObjectTable
            v-model="selectedObjects"
            v-model:page="currentPage"
            v-model:sort-by="tableSorting"
            :show-select="multiSelect"
            :default-headers="TABLE_HEADERS"
            :items="selectableObjects"
            :loading="isLoadingObjects"
            :no-data-text="noDataTextWithLink"
            @click:row="handleRowClick"
          />
        </BaseCard>
      </template>

      <!-- Create View -->
      <template v-else>
        <v-form ref="createForm" v-model="isCreateFormValid" class="pa-4">
          <v-row>
            <v-col cols="12" :md="availableSubTypes.length > 0 ? 6 : 12">
              <v-select
                v-model="createFormObjectType"
                :items="objectTypeOptions"
                :label="t('objectType')"
                :disabled="!!objectType"
                variant="outlined"
                density="comfortable"
                :rules="[requiredRule]"
              />
            </v-col>
            <v-col v-if="availableSubTypes.length > 0" cols="12" md="6">
              <v-select
                v-model="createFormSubType"
                :items="subTypeOptions"
                :label="t('subType')"
                variant="outlined"
                density="comfortable"
                :rules="[requiredRule]"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="createFormAbbreviation"
                :label="t('abbreviation')"
                variant="outlined"
                density="comfortable"
                maxlength="100"
                counter
              />
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="createFormName"
                :label="t('name')"
                variant="outlined"
                density="comfortable"
                :rules="[requiredRule]"
                maxlength="500"
                counter
              />
            </v-col>
          </v-row>
        </v-form>
      </template>
    </template>

    <template #dialog-options>
      <v-btn variant="text" :disabled="isSaving" @click="footerActions.left.action">
        {{ footerActions.left.label }}
      </v-btn>

      <v-spacer />

      <v-btn
        v-for="(btn, i) in footerActions.actions"
        :key="i"
        :variant="btn.variant as VBtnVariant"
        color="primary"
        class="ml-2"
        :disabled="btn.disabled"
        :loading="isSaving"
        @click="btn.action"
      >
        {{ btn.label }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { upperFirst } from 'lodash-es';
import HtmlRenderer from '~/components/base/HtmlRenderer.vue';
import { useVeoUser } from '~/composables/VeoUser';
import { useNavigation } from '~/composables/navigation';
import { useLinkableObjects } from '~/composables/requests/useLinkableObjects';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useTranslations } from '~/composables/Translations';
import type { VeoSearch } from '~/types/VeoSearch';
import type { IVeoEntity, IVeoAPIMessage } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

type VBtnVariant = 'text' | 'flat' | 'outlined' | 'plain' | 'elevated' | 'tonal';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    domainId: string;
    objectType?: string;
    allowSelect?: boolean;
    allowCreate?: boolean;
    multiSelect?: boolean;
    parentObject?: IVeoEntity;
    editParents?: boolean;
    parentScopeIds?: string[];
    preselectedItems?: IVeoEntity[];
    disabledFields?: string[];
    preselectedFilters?: Record<string, any>;
    onLink?: (objects: IVeoEntity[]) => Promise<void>;
    initialTab?: 'select' | 'create';
  }>(),
  {
    objectType: undefined,
    parentObject: undefined,
    onLink: undefined,
    allowSelect: true,
    allowCreate: true,
    multiSelect: false,
    editParents: false,
    parentScopeIds: () => [],
    preselectedItems: () => [],
    disabledFields: () => [],
    preselectedFilters: () => ({}),
    initialTab: 'select'
  }
);

const emit = defineEmits<{
  'update:model-value': [value: boolean];
  success: [objectIds: string[]];
  select: [objects: IVeoEntity[]];
  create: [objectId: string, openEditor: boolean];
  error: [error: any];
}>();

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const { t, locale } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
const { tablePageSize } = useVeoUser();
const { ability, subject } = useVeoPermissions();
const config = useRuntimeConfig();
const { data: translations } = useTranslations({ domain: props.domainId });
const { navigateToCatalog, navigateToObject } = useNavigation();

const navigateToObjectDetail = (objectType: string, objectId: string): string => {
  const routeData = router.resolve({
    name: 'unit-domains-domain-objectType-subType-object',
    params: {
      unit: route.params.unit,
      domain: route.params.domain,
      objectType: VeoElementTypePlurals[objectType] || objectType,
      subType: '-',
      object: objectId
    }
  });
  return routeData.href;
};

const isCreatingNewObject = ref(props.initialTab === 'create' && props.allowCreate);
const isSaving = ref(false);

const objectFilter = ref<Record<string, any>>({});
const searchQueries = ref<VeoSearch[]>([]);
const currentPage = ref(0);
const tableSorting = ref([{ key: 'name', order: 'asc' }]);
const selectedObjects = ref<IVeoEntity[]>([]);

const createFormObjectType = ref(props.objectType || '');
const createFormSubType = ref('');
const createFormName = ref('');
const createFormAbbreviation = ref('');
const isCreateFormValid = ref(false);

// Use composable for all linkable objects logic
const { selectableObjects, originalSelectedItems, isLoadingObjects } = useLinkableObjects({
  domainId: toRef(props, 'domainId'),
  unitId: computed(() => route.params.unit as string),
  filter: objectFilter,
  search: searchQueries,
  page: currentPage,
  sortBy: tableSorting,
  pageSize: tablePageSize,
  parentObject: toRef(props, 'parentObject'),
  editParents: toRef(props, 'editParents'),
  preselectedItems: toRef(props, 'preselectedItems'),
  showCreateView: isCreatingNewObject
});

const hasItems = computed(() => selectableObjects.value?.totalItemCount && selectableObjects.value.totalItemCount > 0);

const domainQueryParams = computed(() => ({ id: props.domainId }));
const shouldFetchDomain = computed(() => !!props.domainId);
const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, domainQueryParams, {
  enabled: shouldFetchDomain
});

const availableObjectTypes = computed<string[]>(() => {
  const objectSchemaNames = Object.keys(VeoElementTypePlurals);
  if (props.objectType) {
    return [props.objectType];
  }
  if (props.parentObject?.type === 'scope') {
    return objectSchemaNames;
  }
  return props.parentObject?.type ? [props.parentObject.type] : objectSchemaNames;
});

const objectTypeOptions = computed(() => {
  return availableObjectTypes.value.map((type) => ({
    value: type,
    title: translations.value?.lang[locale.value]?.[type + '_singular'] || type
  }));
});

const availableSubTypes = computed<string[]>(() => {
  if (!createFormObjectType.value || !domain.value) return [];
  const elementTypeDef = domain.value.elementTypeDefinitions?.[createFormObjectType.value];
  return elementTypeDef?.subTypes ? Object.keys(elementTypeDef.subTypes) : [];
});

const subTypeOptions = computed(() => {
  return availableSubTypes.value.map((subType) => ({
    value: subType,
    title: getSubTypeTranslation(subType)
  }));
});

const getSubTypeTranslation = (subType: string) => {
  if (!subType) return '';
  const translationKey = `${createFormObjectType.value}_${subType}`;
  return translations.value?.lang[locale.value]?.[translationKey + '_singular'] || subType;
};

const TABLE_HEADERS = ['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt'];

const noDataTextWithLink = computed(() => {
  if (hasItems.value) return () => h(HtmlRenderer, { content: t('noSearchResults') });

  if (objectFilter.value.objectType === 'control') {
    return () =>
      h(HtmlRenderer, {
        content: t('controlNoDataText', {
          catalogLink: `<a href="#">${t('catalog')}</a>`
        }),
        clickHandler: navigateToCatalog,
        clickHandlerParams: ['control', 'CTL_Module']
      });
  }

  const objectType = objectFilter.value.objectType;
  const pluralKey = objectType ? `${objectType}_plural` : '';
  const translatedPlural = translations.value?.lang[locale.value]?.[pluralKey]?.toString();

  return () =>
    h(HtmlRenderer, {
      content: t('nonControlNoDataText', {
        subType: upperFirst(translatedPlural || t('objects')),
        correspondingObject: `<a href="#">${t('correspondingObject')}</a>`
      }),
      clickHandler: navigateToObject,
      clickHandlerParams: [VeoElementTypePlurals[objectType as keyof typeof VeoElementTypePlurals]]
    });
});

const dialogTitle = computed(() =>
  isCreatingNewObject.value ?
    t('createObjectTitle', { type: translatedType.value.singular })
  : t('selectObjectTitle', { type: translatedType.value.plural })
);

const displayedType = computed(() => ({
  type: isCreatingNewObject.value ? createFormObjectType.value : objectFilter.value.objectType || props.objectType
}));

const translatedType = computed(() => {
  const type = displayedType.value.type;
  return {
    singular: translations.value?.lang[locale.value]?.[type] || t('object'),
    plural: translations.value?.lang[locale.value]?.[`${type}_plural`] || t('objects')
  };
});

// Items that will be linked (excluding already linked items)
const itemsToBeLinked = computed(() => {
  const alreadyLinkedIds = new Set(originalSelectedItems.value.map((item) => item.id));
  return selectedObjects.value.filter((item) => !alreadyLinkedIds.has(item.id));
});

const selectButtonLabel = computed(() => {
  if (props.multiSelect && itemsToBeLinked.value.length > 0) {
    return t('selectObjectsCount', { type: translatedType.value.plural, count: itemsToBeLinked.value.length });
  }
  return t('selectObjectButton', { type: translatedType.value.plural });
});

const hasValidSelection = computed(() =>
  props.multiSelect ? itemsToBeLinked.value.length > 0 : itemsToBeLinked.value.length === 1
);

const hasUnsavedChanges = computed(() =>
  isCreatingNewObject.value ?
    !!createFormName.value || !!createFormAbbreviation.value
  : itemsToBeLinked.value.length > 0
);

const canManageUnitContent = computed(() => ability.value.can('manage', subject('units', { id: route.params.unit })));

const requiredRule = (v: string) => !!v || t('fieldRequired');

const updateObjectFilter = (updatedFilter: Record<string, any>) => {
  objectFilter.value = { ...updatedFilter };
};

const handleRowClick = (_event: Event, row: { item: IVeoEntity & { disabled?: boolean } }) => {
  if (!props.multiSelect && !row.item.disabled) {
    selectedObjects.value = [row.item];
  }
};

const handleDialogClose = (value: boolean) => {
  emit('update:model-value', value);
};

const resetDialogState = () => {
  selectedObjects.value = [];
  createFormSubType.value = '';
  createFormName.value = '';
  createFormAbbreviation.value = '';
  searchQueries.value = [];
  currentPage.value = 0;
  isCreatingNewObject.value = false;
};

const handleSelectObjects = async () => {
  if (!canManageUnitContent.value || !hasValidSelection.value) return;

  isSaving.value = true;
  try {
    const objectsToLink = itemsToBeLinked.value;
    if (props.onLink && objectsToLink.length > 0) {
      await props.onLink(objectsToLink);
    }
    const objectIds = objectsToLink.map((obj) => obj.id);
    emit('select', objectsToLink);
    emit('success', objectIds);
    handleDialogClose(false);
    displaySuccessMessage(t('objectsLinked'));
  } catch (error: any) {
    displayErrorMessage(t('linkError'), error.message);
    emit('error', error);
  } finally {
    isSaving.value = false;
  }
};

const { mutateAsync: createObject } = useMutation(objectQueryDefinitions.mutations.createObject);

const handleCreateButtonClick = async () => {
  if (!isCreatingNewObject.value) {
    isCreatingNewObject.value = true;
  } else {
    await createObjectAndClose();
  }
};

const handleCreateAndEdit = () => performCreateObject(true);
const createObjectAndClose = () => performCreateObject(false);

const performCreateObject = async (openEditor: boolean) => {
  if (!canManageUnitContent.value || !isCreateFormValid.value) return;

  isSaving.value = true;

  try {
    const payload = buildNewObjectPayload();

    const result = (await createObject({
      endpoint: VeoElementTypePlurals[createFormObjectType.value],
      object: payload,
      parentScopes: props.parentScopeIds
    })) as IVeoAPIMessage;

    const newObjectId = result.resourceId;

    // WAIT until object is readable
    const createdObject = await useQuerySync(
      objectQueryDefinitions.queries.fetch,
      {
        domain: props.domainId,
        endpoint: VeoElementTypePlurals[createFormObjectType.value],
        id: newObjectId
      },
      queryClient
    );

    if (props.parentObject && props.onLink) {
      await props.onLink([createdObject]);
    }

    emit('create', newObjectId, openEditor);
    emit('success', [newObjectId]);
    displaySuccessMessage(t('objectCreatedSuccess', { name: createFormName.value }));

    if (openEditor) {
      router.push(navigateToObjectDetail(createFormObjectType.value, newObjectId));
    }

    handleDialogClose(false);
  } catch (error: any) {
    displayErrorMessage(t('createError'), error.message);
    emit('error', error);
  } finally {
    isSaving.value = false;
  }
};

const buildNewObjectPayload = () => {
  return {
    type: createFormObjectType.value,
    name: createFormName.value,
    abbreviation: createFormAbbreviation.value || undefined,
    subType: createFormSubType.value,
    status: 'NEW',
    owner: {
      targetUri: `${config.public.apiUrl}/units/${route.params.unit as string}`
    }
  };
};
const initializeDialogState = () => {
  isCreatingNewObject.value = props.initialTab === 'create' && props.allowCreate;

  const originals = originalSelectedItems.value;
  selectedObjects.value = originals.length ? [...originals] : [...props.preselectedItems];

  const defaultType = props.objectType || availableObjectTypes.value[0];
  if (defaultType) {
    objectFilter.value = { ...props.preselectedFilters, objectType: defaultType };
    createFormObjectType.value = defaultType;
  }
};

const footerActions = computed(() => {
  if (isCreatingNewObject.value) {
    return {
      left: {
        label: globalT('global.button.back'),
        action: () => (isCreatingNewObject.value = false)
      },
      actions:
        props.allowCreate ?
          [
            {
              label: t('createAndOpen'),
              variant: 'outlined',
              disabled: !isCreateFormValid.value,
              action: handleCreateAndEdit
            },
            {
              label: t('createObjectButton', { type: translatedType.value.singular }),
              variant: 'flat',
              disabled: !isCreateFormValid.value,
              action: handleCreateButtonClick
            }
          ]
        : []
    };
  }

  return {
    left: {
      label: globalT('global.button.cancel'),
      action: () => handleDialogClose(false)
    },
    actions: [
      props.allowCreate && {
        label: t('createObjectButton', { type: translatedType.value.singular }),
        variant: 'text',
        disabled: itemsToBeLinked.value.length > 0 || isSaving.value,
        action: handleCreateButtonClick
      },
      props.allowSelect && {
        label: selectButtonLabel.value,
        variant: 'flat',
        disabled: !hasUnsavedChanges.value,
        action: handleSelectObjects
      }
    ].filter(Boolean)
  };
});

watch(
  () => props.modelValue,
  (open) => open && initializeDialogState(),
  { immediate: true }
);

watch(originalSelectedItems, (linked) => {
  if (!props.modelValue) return;

  const linkedIds = new Set(linked.map((i) => i.id));
  const newlySelected = selectedObjects.value.filter((i) => !linkedIds.has(i.id));

  selectedObjects.value = [...linked, ...newlySelected];
});

watch([isCreatingNewObject, availableSubTypes], ([isCreating, subTypes]) => {
  if (isCreating && subTypes.length === 1) {
    createFormSubType.value = subTypes[0];
  }
});
</script>

<i18n src="~/locales/base/components/add-object-dialog.json"></i18n>
<i18n src="~/locales/base/components/object-link-dialog.json"></i18n>
