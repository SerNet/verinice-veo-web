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
    :clearable="!required"
    :return-object="valueAsEntity"
    v-bind="$attrs"
    variant="underlined"
    @update:search="updateSearchQuery"
    @click="() => updateSearchQuery()"
    @click:clear="onClearClicked"
  >
    <template #prepend-item>
      <slot name="prepend-item" />
    </template>
    <template
      v-if="moreItemsAvailable"
      #append-item
    >
      <v-list-item>
        <v-list-item-subtitle>
          {{ t('beMoreSpecific') }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <template
      #item="{ props, item }"
    >
      <v-list-item v-bind="props">
        <template #prepend>
          <ObjectIcon
            :object-type="item.raw.type"
            :is-composite="!!(item.raw.parts && item.raw.parts.length)"
            left
          />
        </template>
        <template #append>
          <v-hover v-slot="{ hover }">
            <v-icon
              end
              style="z-index: 5000;"
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
import { cloneDeep, upperFirst } from 'lodash';
import { mdiOpenInNew } from '@mdi/js';

import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE } from '~~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';
import { getEntityDetailsFromLink } from '~/lib/utils';
import { IVeoEntity, IVeoLink, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import { useQuery } from '~~/composables/api/utils/query';
import { useFetchObjects } from '~~/composables/api/objects';



type ModelVal = string | IVeoLink | IVeoEntity | undefined;
interface Props {
  modelValue?: ModelVal;
  required: boolean;
  label: string | undefined;
  objectType: string;
  subType: string | undefined;
  domainId: string | undefined;
  valueAsLink?: boolean;
  valueAsEntity?: boolean;
  hiddenValues?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  required: false,
  label: undefined,
  subType: undefined,
  domainId: undefined,
  valueAsLink: false,
  valueAsEntity: false,
  hiddenValues: () => []
});

const emit = defineEmits<{
  (e: 'update:model-value', modelValue: IVeoEntity): void
}>();

const config = useRuntimeConfig();
const { locale, t } = useI18n();
const { displayErrorMessage } = useVeoAlerts();
const router = useRouter();
const route = useRoute();

const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);

const internalValue = computed<string | undefined>({
  get: () => {
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      if (props.valueAsEntity) {
        return (props.modelValue as IVeoEntity).id;
      } else {
        return getEntityDetailsFromLink(props.modelValue as IVeoLink).id;
      }
    } else {
      return props.modelValue as string;
    }
  },
  set: (newValue: string | undefined | null) =>
  {
    if (!newValue && !props.required) {
      emit('update:model-value', newValue);
    } else if (props.valueAsLink) {
      emit('update:model-value', newValue ? { targetUri: `${config.public.apiUrl}/${endpoints.value?.[props.objectType]}/${newValue}` } : undefined);
    } else {
      emit('update:model-value', newValue);
    }
  }
});

// Select options related stuff
const searchQuery = ref();

const fetchObjectsData = ref<IVeoPaginatedResponse<IVeoEntity[]>>();
const endpoint = computed(() => endpoints.value?.[props.objectType]);
const searchQueryNotStale = computed(() => !fetchObjectsData?.value?.items?.find((item) => item.displayName === searchQuery.value) && !!endpoint.value);
const fetchObjectsQueryParameters = computed(
  () =>
    ({
      unit: route.params.unit,
      endpoint: endpoint.value,
      page: 1,
      subType: props.subType,
      displayName: searchQuery.value ?? undefined
    } as any)
);
const {
  data: _fetchObjectsData,
  isFetching: isLoadingObjects
} = useFetchObjects(fetchObjectsQueryParameters, {
  placeholderData: { items: [], pageCount: 0, page: 1 },
  enabled: searchQueryNotStale,
  refetchOnMount: false // If set to true (the default), refetches queries every time input changes, causing some weird cache issues
});

watch(() => _fetchObjectsData.value, (newValue) => {
  fetchObjectsData.value = cloneDeep(newValue);
}, { deep: true, immediate: true });

const updateSearchQuery = (newValue = '') => {
  searchQuery.value = newValue;
};

const onClearClicked = () => {
  searchQuery.value = '';
  internalValue.value = undefined;
};

const moreItemsAvailable = computed(() => (fetchObjectsData.value?.pageCount || 0) > 1);

const fetchObjectQueryParameters = computed(
  () =>
    ({
      endpoint: endpoints.value?.[props.objectType],
      id: internalValue.value
    } as any)
);
const fetchObjectQueryEnabled = computed(() => !!unref(internalValue) && !!endpoints.value?.[props.objectType]);
const { data: fetchObjectData, isFetching: isLoadingObject, isError } = useQuery(objectQueryDefinitions.queries.fetch, fetchObjectQueryParameters, { enabled: fetchObjectQueryEnabled });

watch(
  () => isError.value,
  (newValue) => {
    if (newValue) {
      displayErrorMessage(upperFirst(t('objectNotFound').toString()), t('objectNotFoundExplanation', [props.label, internalValue.value]).toString());
    }
  }
);

const isLoading = computed(() => isLoadingObjects.value || isLoadingObject.value);

const items = computed<IVeoEntity[]>(() => [
  ...(fetchObjectsData.value?.items || []),
  ...(!!unref(internalValue) && fetchObjectData.value && !fetchObjectsData.value?.items?.find((item) => item.id === fetchObjectData.value.id) ? [fetchObjectData.value] : [])
]);
const displayedItems = computed(() => (props.hiddenValues.length ? items.value.filter((item) => !props.hiddenValues.includes(item.id)) : items.value));

// Label
const formsQueryParameters = computed(() => ({ domainId: props.domainId as string }));
const formsQueryEnabled = computed(() => !props.domainId);
const { data: formSchemas } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, { enabled: formsQueryEnabled });

const currentSubTypeFormName = computed(() => props.subType && (formSchemas.value || []).find((formSchema) => formSchema.subType === props.subType)?.name[locale.value]);
const localLabel = computed(() => props.label ?? `${currentSubTypeFormName.value ? currentSubTypeFormName.value : upperFirst(props.objectType)}${props.required ? '*' : ''}`);

// Object select display
const openItem = (item: IVeoEntity) => {
  const routeData = router.resolve({
    name: OBJECT_OVERVIEW_ROUTE,
    params: {
      ...route.params,
      object: item.id
    }
  });
  window.open(routeData.href, '_blank');
};
</script>

<i18n>
{
  "en": {
    "beMoreSpecific": "Please be more specific to show additional objects",
    "errorWhileFetching": "Error while fetching objects",
    "noObjects": "No objects found",
    "objectNotFound": "object not found",
    "objectNotFoundExplanation": "The object for the link \"{0}\" with the ID \"{1}\" couldn't be found."
  },
  "de": {
    "beMoreSpecific": "Bitte geben Sie weitere Zeichen ein, um die Auswahl einzuschränken",
    "errorWhileFetching": "Beim Laden der Objekte ist ein Fehler aufgetreten",
    "noObjects": "Keine Objekte vorhanden",
    "objectNotFound": "Objekt nicht gefunden",
    "objectNotFoundExplanation": "Das Objekt für die Verlinkung \"{0}\" mit der ID \"{1}\" konnte nicht gefunden werden."
  }
}
</i18n>
