<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <v-autocomplete
    v-model="internalValue"
    :items="displayedItems"
    item-title="displayName"
    item-value="id"
    :no-data-text="t('noObjects')"
    :loading="isLoading"
    no-filter
    :label="localLabel"
    :aria-label="localLabel"
    v-bind="$attrs"
    variant="underlined"
    @input="onSearchInput"
    @click="() => updateSearchQuery()"
    @click:clear="onClearClicked"
  >
    <template #prepend-item>
      <slot name="prepend-item"></slot>
    </template>
    <template v-if="moreItemsAvailable" #append-item>
      <v-list-item>
        <v-list-item-subtitle>
          {{ t('beMoreSpecific') }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <template #item="{ props: _props, item }">
      <v-list-item v-bind="_props" data-veo-test="object-select-item">
        <template #prepend>
          <ObjectIcon :object-type="item.raw.type" :is-composite="!!(item.raw.parts && item.raw.parts.length)" left />
        </template>
        <template #append>
          <!-- @vue-ignore TODO #3066 does not exist -->
          <v-hover v-slot="{ hover }">
            <v-icon
              end
              style="z-index: 5000"
              :color="hover ? 'primary' : ''"
              :icon="mdiOpenInNew"
              @click="openItem(item.raw)"
            />
          </v-hover>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js';
import { cloneDeep, upperFirst } from 'lodash';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { useFetchObjects } from '~/composables/api/objects';
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuery } from '~/composables/api/utils/query';
import { ROUTE_NAME as OBJECT_DETAILS_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import type { IVeoEntity, IVeoLink, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

interface Props {
  objectType: string;
  modelValue?: IVeoLink;
  label?: string | undefined;
  subType?: string | undefined;
  domainId?: string | undefined;
  hiddenValues?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: undefined,
  subType: undefined,
  domainId: undefined,
  hiddenValues: () => []
});

const emit = defineEmits<{
  (e: 'update:model-value', modelValue: IVeoLink): void;
}>();

const { locale, t } = useI18n();
const { displayErrorMessage } = useVeoAlerts();
const router = useRouter();
const route = useRoute();

const { createLink } = useCreateLink();

const internalValue = computed<string | undefined>({
  get: () => {
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      return (props.modelValue as IVeoLink).id;
    } else {
      return undefined;
    }
  },
  set: (newValue: string | undefined | null) => {
    emit('update:model-value', newValue ? createLink(VeoElementTypePlurals[props.objectType], newValue) : undefined);
  }
});

// Select options related stuff
const searchQuery = ref();

const fetchObjectsData = ref<IVeoPaginatedResponse<IVeoEntity[]>>();
const endpoint = computed(() => VeoElementTypePlurals[props.objectType]);
const searchQueryNotStale = computed(
  () => !fetchObjectsData?.value?.items?.find((item) => item.displayName === searchQuery.value) && !!endpoint.value
);
const fetchObjectsQueryParameters = computed(
  () =>
    ({
      unit: route.params.unit,
      endpoint: endpoint.value,
      page: 0,
      ...(props.subType !== undefined ? { subType: props.subType } : {}),
      displayName: searchQuery.value ?? undefined
    }) as any
);
const { data: _fetchObjectsData, isFetching: isLoadingObjects } = useFetchObjects(fetchObjectsQueryParameters, {
  placeholderData: { items: [], pageCount: 0, page: 0, totalItemCount: 0 },
  enabled: searchQueryNotStale,
  refetchOnMount: false // If set to true (the default), refetches queries every time input changes, causing some weird cache issues
});

watch(
  () => _fetchObjectsData.value,
  (newValue) => {
    fetchObjectsData.value = cloneDeep(newValue);
  },
  { deep: true, immediate: true }
);

const updateSearchQuery = (newValue = '') => {
  searchQuery.value = newValue;
};

const onSearchInput = (event: InputEvent) => {
  const typedValue: string = (event.target as HTMLInputElement).value;
  searchQuery.value = typedValue;
};

const onClearClicked = () => {
  searchQuery.value = '';
  internalValue.value = undefined;
};

const moreItemsAvailable = computed(() => (fetchObjectsData.value?.pageCount || 0) > 1);

const fetchObjectQueryParameters = computed(
  () =>
    ({
      endpoint: VeoElementTypePlurals[props.objectType],
      id: internalValue.value
    }) as any
);
const fetchObjectQueryEnabled = computed(() => !!unref(internalValue) && !!VeoElementTypePlurals[props.objectType]);
const {
  data: fetchObjectData,
  isFetching: isLoadingObject,
  isError
} = useQuery(objectQueryDefinitions.queries.fetch, fetchObjectQueryParameters, {
  enabled: fetchObjectQueryEnabled
});

watch(
  () => isError.value,
  (newValue) => {
    if (newValue) {
      displayErrorMessage(
        upperFirst(t('objectNotFound').toString()),
        t('objectNotFoundExplanation', [props.label, internalValue.value]).toString()
      );
    }
  }
);

const isLoading = computed(() => isLoadingObjects.value || isLoadingObject.value);

const items = computed<IVeoEntity[]>(() => [
  ...(fetchObjectsData.value?.items || []),
  ...((
    !!unref(internalValue) &&
    fetchObjectData.value &&
    !fetchObjectsData.value?.items?.find((item) => item.id === fetchObjectData.value.id)
  ) ?
    [fetchObjectData.value]
  : [])
]);
const displayedItems = computed(() =>
  props.hiddenValues.length ? items.value.filter((item) => !props.hiddenValues.includes(item.id)) : items.value
);

// Label
const formsQueryParameters = computed(() => ({
  domainId: props.domainId as string
}));
const formsQueryEnabled = computed(() => !props.domainId);
const { data: formSchemas } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, {
  enabled: formsQueryEnabled
});

const currentSubTypeFormName = computed(
  () =>
    props.subType &&
    (formSchemas.value || []).find((formSchema) => formSchema.subType === props.subType)?.name[locale.value]
);
const localLabel = computed(
  () =>
    props.label ?? `${currentSubTypeFormName.value ? currentSubTypeFormName.value : upperFirst(props.objectType)}${'*'}`
);

// Object select display
const openItem = (item: IVeoEntity) => {
  const typeLink = item.type === 'process' ? `${item.type}es` : `${item.type}s`;

  const routeData = router.resolve({
    name: OBJECT_DETAILS_ROUTE,
    params: {
      ...route.params,
      subType: item.subType,
      objectType: typeLink,
      object: item.id
    }
  });

  window.open(routeData.href, '_blank');
};
</script>

<i18n src="~/locales/base/components/util-object-select.json"></i18n>
