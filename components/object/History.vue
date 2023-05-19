<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Annemarie Bufe
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
  <div>
    <h2 class="text-h2 px-4 pt-1">
      {{ t('history').toString() }}
    </h2>
    <div v-if="isLoading">
      <div
        v-for="index in [1, 2]"
        :key="index"
        class="my-6 px-4"
      >
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader
          type="text"
          class="my-2"
        />
        <v-skeleton-loader type="text" />
      </div>
    </div>
    <v-list
      v-else
      class="py-0"
      mandatory
    >
      <div
        v-for="(version, index) of historyEntriesWithCompability"
        :key="version.changeNumber"
      >
        <v-divider v-if="index > 0" />
        <v-tooltip
          location="bottom"
          :disabled="version.compability.valid"
        >
          <template #activator="{ props }">
            <div v-bind="props">
              <v-list-item
                lines="three"
                :disabled="!version.compability.valid"
                :value="index"
                :active="selectedRevision === index"
                active-color="primary"
                @click="selectedRevision = index"
              >
                <v-list-item-title>
                  {{ t('version') }}
                  <b>{{ version.changeNumber + 1 }}</b>
                  : {{ (new Date(version.time)).toLocaleString(locale) }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ t('by') }}
                  <b>{{ version.author }}</b>
                </v-list-item-subtitle>
                <v-list-item-subtitle>{{ t('type') }}: {{ t(`revisionType.${version.type}`) }}</v-list-item-subtitle>
              </v-list-item>
            </div>
          </template>
          <template #default>
            {{ t('dataIncompatible') }}
          </template>
        </v-tooltip>
      </div>
      <v-list-item
        v-if="!historyEntriesWithCompability.length"
        disabled
      >
        <i class="text-body-2">{{ t('noPriorVersions') }}</i>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash';
import { PropType } from 'vue';

import { useFetchVersions } from '~/composables/api/history';
import ObjectSchemaValidator, { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';
import { IVeoEntity, IVeoObjectHistoryEntry } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    object: {
      type: Object as PropType<IVeoEntity>,
      required: true
    },
    objectSchema: {
      type: Object,
      default: undefined
    }
  },
  emits: ['show-revision'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();

    const fetchVersionsQueryParameters = computed(() => ({ object: props.object }));
    const fetchVersionsQueryEnabled = computed(() => !!props.object);
    const { data: history, isLoading } = useFetchVersions(fetchVersionsQueryParameters, {
      enabled: fetchVersionsQueryEnabled,
      keepPreviousData: true,
      refetchInterval: 2000 // The history service gets updated asynchronusly, but as soon as an object gets saved, the history gets refetched. To avoid using outdated data, we refetch ever 2 seconds.
    });

    const historyEntries = computed(() =>
      cloneDeep((history.value || [])).sort((a, b) => {
        return a.changeNumber > b.changeNumber ? -1 : a.changeNumber < b.changeNumber ? 1 : 0;
      })
    );

    const historyEntriesWithCompability = computed<(IVeoObjectHistoryEntry & { compability: VeoSchemaValidatorValidationResult })[]>(() =>
      historyEntries.value.map((entry) => ({ ...entry, compability: isDataCompatible(entry) }))
    );

    const isDataCompatible = (data: IVeoObjectHistoryEntry): VeoSchemaValidatorValidationResult => {
      if (!props.objectSchema) {
        return { valid: true, errors: [], warnings: [] };
      }
      return ObjectSchemaValidator.fitsObjectSchema(props.objectSchema, data.content);
    };

    const selectedRevision = ref(0);
    watch(() => selectedRevision.value, (newValue) => {
      emit('show-revision', historyEntriesWithCompability.value[newValue], !!newValue);
    });

    return {
      historyEntriesWithCompability,
      isLoading,
      selectedRevision,

      t,
      locale
    };
  }
});
</script>

<i18n>
{
  "en": {
    "by": "by",
    "dataIncompatible": "This revision is incompatible with the schema and cannot be displayed.",
    "history": "History",
    "noPriorVersions": "There are no prior versions for this object.",
    "restoreRevision": "Restore version",
    "revisionType": {
      "CREATION": "Object created",
      "MODIFICATION": "Object modified",
      "SOFT_DELETION": "Object soft deleted"
    },
    "type": "Type",
    "version": "Version"
  },
  "de": {
    "by": "by",
    "dataIncompatible": "Diese Version ist inkompatibel mit dem Schema und kann nicht angezeigt werden.",
    "history": "Verlauf",
    "noPriorVersions": "Für dieses Objekt gibt es keine Vorgängeversionen.",
    "restoreRevision": "Version wiederherstellen",
    "revisionType": {
      "CREATION": "Objekt erstellt",
      "MODIFICATION": "Objekt bearbeitet",
      "SOFT_DELETION": "Objekt als gelöscht markiert"
    },
    "type": "Art",
    "version": "Version"
  }
}
</i18n>
