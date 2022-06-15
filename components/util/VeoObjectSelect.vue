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
    :value="internalValue"
    :items="items"
    item-text="name"
    item-value="id"
    :no-data-text="t('noObjects')"
    no-filter
    :label="localLabel"
    :search-input="searchQuery"
    :clearable="!required"
    :return-object="valueAsEntity"
    v-bind="$attrs"
    @change="onInput"
    @input="onInput"
    @update:search-input="onSearchInputUpdate"
  >
    <template
      v-if="moreItemsAvailable"
      #append-item
    >
      <v-list-item>
        {{ t('beMoreSpecific') }}
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext, useFetch, watch } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { getSchemaEndpoint } from '~/plugins/api/schema';
import { getEntityDetailsFromLink } from '~/lib/utils';
import { IVeoEntity, IVeoFormSchemaMeta, IVeoLink } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';

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
    }
  },
  setup(props, { emit }) {
    const { $api, $config } = useContext();
    const { locale, t } = useI18n();
    const { displayErrorMessage } = useVeoAlerts();

    // Select options related stuff
    const searchQuery = ref('');
    const items = ref<IVeoEntity[]>([]);
    const moreItemsAvailable = ref(false);

    const loadObjects = async (displayName?: string, onlyAssignItemsIfItemsExist = false) => {
      const data = await $api.entity.fetchAll(props.objectType, 1, {
        subType: props.subType,
        displayName: displayName ?? undefined
      });
      moreItemsAvailable.value = data.pageCount > 1;

      if (data.items.length || !onlyAssignItemsIfItemsExist) {
        items.value = data.items;
        // Only throw a message if we searched for a query string
      } else if (displayName) {
        throw new Error(t('errorWhileFetching').toString());
      }
    };

    const onSearchInputUpdate = async (query: string) => {
      try {
        await loadObjects(query, true);
        searchQuery.value = query;
      } catch (e: any) {
        displayErrorMessage(e.message, props.label);
      }
    };

    // value stuff
    const loadObject = async (id: string) => {
      items.value.push(await $api.entity.fetch(props.objectType, id));
    };

    const internalValue = computed<string | undefined>(() => {
      if (typeof props.value === 'object' && props.value !== null) {
        if (props.valueAsEntity) {
          return (props.value as IVeoEntity).id;
        } else {
          return getEntityDetailsFromLink(props.value as IVeoLink).id;
        }
      } else {
        return props.value;
      }
    });

    watch(
      () => internalValue.value,
      (newValue) => {
        if (!!newValue && !items.value.find((item) => item.id === newValue)) {
          loadObject(newValue);
        } else if (!newValue) {
          loadObjects(searchQuery.value);
        }
      },
      {
        immediate: true
      }
    );

    const schemas = ref();
    useFetch(async () => {
      schemas.value = await $api.schema.fetchAll();
    });

    const onInput = (newValue: string) => {
      if (props.valueAsLink) {
        emit('input', newValue ? { targetUri: `${$config.apiUrl}/${getSchemaEndpoint(schemas.value, props.objectType)}/${newValue}` } : undefined);
      } else {
        emit('input', newValue);
      }
    };

    // Label stuff
    const formSchemas = ref<IVeoFormSchemaMeta[]>([]);
    const { fetch: fetchFormSchemas } = useFetch(async () => {
      if (props.domainId) {
        formSchemas.value = await $api.form.fetchAll(props.domainId);
      }
    });
    watch(
      () => props.domainId,
      () => fetchFormSchemas
    );

    const currentSubTypeFormName = computed(() => props.subType && formSchemas.value.find((formSchema) => formSchema.subType === props.subType)?.name[locale.value]);
    const localLabel = computed(() => props.label ?? `${currentSubTypeFormName.value ? currentSubTypeFormName.value : upperFirst(props.objectType)}${props.required ? '*' : ''}`);

    return {
      localLabel,
      internalValue,
      items,
      moreItemsAvailable,
      onInput,
      onSearchInputUpdate,
      searchQuery,

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
    "noObjects": "No objects found"
  },
  "de": {
    "beMoreSpecific": "Bitte geben Sie weitere Zeichen ein, um die Auswahl einzuschränken",
    "errorWhileFetching": "Beim Laden der Objekte ist ein Fehler aufgetreten",
    "noObjects": "Keine Objekte vorhanden"
  }
}
</i18n>
