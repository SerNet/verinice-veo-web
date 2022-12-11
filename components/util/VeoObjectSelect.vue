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
    item-text="displayName"
    item-value="id"
    :no-data-text="t('noObjects')"
    :loading="isLoading"
    no-filter
    :label="localLabel"
    :search-input="searchQuery"
    :clearable="!required"
    :return-object="valueAsEntity"
    v-bind="$attrs"
    @update:search-input="onSearchQueryInput"
  >
    <template #prepend-item>
      <slot name="prepend-item" />
    </template>
    <template
      v-if="moreItemsAvailable"
      #append-item
    >
      <v-list-item>
        {{ t('beMoreSpecific') }}
      </v-list-item>
    </template>
    <template
      #item="{ item }"
    >
      <VeoObjectIcon
        :object-type="item.type"
        :is-composite="!!(item.parts && item.parts.length)"
        left
      />
      {{ item.displayName }}
      <v-hover v-slot="{ hover }">
        <v-icon
          right
          style="z-index: 5000;"
          :color="hover ? 'primary' : ''"
          @click="openItem(item)"
        >
          {{ mdiOpenInNew }}
        </v-icon>
      </v-hover>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, unref, useContext, useRoute, useRouter, watch } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { mdiOpenInNew } from '@mdi/js';
import { createUUIDUrlParam, getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoLink } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useFetchObject, useFetchObjects } from '~/composables/api/objects';
import { useFetchForms } from '~/composables/api/forms';
import { useFetchSchemas } from '~/composables/api/schemas';

export default defineComponent({
  props: {
    value: {
      type: [String, Object] as PropType<string | IVeoLink | IVeoEntity>,
      default: undefined
    },
    required: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: undefined
    },
    objectType: {
      type: String,
      required: true
    },
    subType: {
      type: String,
      default: undefined
    },
    domainId: {
      type: String,
      default: undefined
    },
    valueAsLink: {
      type: Boolean,
      default: false
    },
    valueAsEntity: {
      type: Boolean,
      default: false
    },
    hiddenValues: {
      type: Array as PropType<String[]>,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const { $config } = useContext();
    const { locale, t } = useI18n();
    const { displayErrorMessage } = useVeoAlerts();
    const router = useRouter();
    const route = useRoute();

    const unit = computed(() => separateUUIDParam(route.value.params.unit).id);

    // Value related stuff
    const { data: endpoints } = useFetchSchemas();

    const internalValue = computed<string | undefined>({
      get: () => {
        if (typeof props.value === 'object' && props.value !== null) {
          if (props.valueAsEntity) {
            return (props.value as IVeoEntity).id;
          } else {
            return getEntityDetailsFromLink(props.value as IVeoLink).id;
          }
        } else {
          return props.value;
        }
      },
      set: (newValue: string | undefined) => {
        if (props.valueAsLink) {
          emit('input', newValue ? { targetUri: `${$config.apiUrl}/${endpoints.value?.[props.objectType]}/${newValue}` } : undefined);
        } else {
          emit('input', newValue);
        }
      }
    });

    // Select options related stuff
    const searchQuery = ref();

    const endpoint = computed(() => endpoints.value?.[props.objectType]);
    const searchQueryNotStale = computed(() => !fetchObjectsData?.value?.items?.find((item) => item.displayName === searchQuery.value) && !!endpoint.value);
    const fetchObjectsQueryParameters = computed(
      () =>
        ({
          unit: unit.value,
          endpoint: endpoint.value,
          page: 1,
          subType: props.subType,
          displayName: searchQuery.value ?? undefined
        } as any)
    );
    const {
      data: fetchObjectsData,
      isFetching: isLoadingObjects,
      refetch
    } = useFetchObjects(fetchObjectsQueryParameters, {
      placeholderData: { items: [], pageCount: 0, page: 1 },
      enabled: searchQueryNotStale
    });

    const onSearchQueryInput = (newValue: string) => {
      searchQuery.value = newValue;
      refetch();
    };

    const moreItemsAvailable = computed(() => (fetchObjectsData.value?.pageCount || 0) > 0);

    const fetchObjectQueryParameters = computed(
      () =>
        ({
          endpoint: endpoints.value?.[props.objectType],
          id: internalValue.value
        } as any)
    );
    const fetchObjectQueryEnabled = computed(() => !!unref(internalValue) && !!endpoints.value?.[props.objectType]);
    const { data: fetchObjectData, isFetching: isLoadingObject, isError } = useFetchObject(fetchObjectQueryParameters, { enabled: fetchObjectQueryEnabled });

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
      ...(fetchObjectData.value && !fetchObjectsData.value?.items?.find((item) => item.id === fetchObjectData.value.id) ? [fetchObjectData.value] : [])
    ]);
    const displayedItems = computed(() => (props.hiddenValues.length ? items.value.filter((item) => !props.hiddenValues.includes(item.id)) : items.value));

    // Label stuff
    const formsQueryParameters = computed(() => ({ domainId: props.domainId }));
    const formsQueryEnabled = computed(() => !props.domainId);
    const { data: formSchemas } = useFetchForms(formsQueryParameters, { enabled: formsQueryEnabled });

    const currentSubTypeFormName = computed(() => props.subType && (formSchemas.value || []).find((formSchema) => formSchema.subType === props.subType)?.name[locale.value]);
    const localLabel = computed(() => props.label ?? `${currentSubTypeFormName.value ? currentSubTypeFormName.value : upperFirst(props.objectType)}${props.required ? '*' : ''}`);

    // Object select display
    const openItem = (item: IVeoEntity) => {
      const routeData = router.resolve({
        name: 'unit-domains-domain-objects-entity',
        params: {
          ...route.value.params,
          entity: createUUIDUrlParam(item.type, item.id)
        }
      });
      window.open(routeData.href, '_blank');
    };

    return {
      displayedItems,
      localLabel,
      internalValue,
      isLoading,
      isLoadingObjects,
      isLoadingObject,
      items,
      moreItemsAvailable,
      onSearchQueryInput,
      searchQuery,
      mdiOpenInNew,
      openItem,

      t
    };
  }
});
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
