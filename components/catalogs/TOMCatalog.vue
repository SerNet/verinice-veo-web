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
  <div v-if="state === CATALOG_STATE.CHOOSE_TOMS">
    <h2 class="text-h2 mt-0">
      {{ t('selectTOMs') }}
    </h2>
    <p class="text-body-1">
      {{ t('selectTOMCTA') }}
    </p>
    <VeoCard>
      <VeoCatalogSelectionList
        v-model="selectedToms"
        :items="availableToms"
        :loading="loading"
        :headers="catalogTableHeaders"
        selectable
      />
    </VeoCard>
    <v-row
      dense
      class="mt-4"
    >
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          text
          class="mr-2"
          :disabled="selectedToms.length === 0"
          @click="selectedToms = []"
        >
          {{ t('global.button.cancel') }}
        </v-btn>
        <v-btn
          depressed
          color="primary"
          :disabled="selectedToms.length === 0"
          @click="state = CATALOG_STATE.CHOOSE_ENTITIES"
        >
          {{ t('global.button.next') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
  <div v-else-if="state === CATALOG_STATE.CHOOSE_ENTITIES">
    <p class="text-h3">
      {{ upperFirst(t('selectedTOMs').toString()) }}
    </p>
    <VeoCard>
      <VeoCatalogSelectionList
        :items="selectedTOMsFormatted"
        :headers="catalogTableHeaders"
        :selectable="false"
      />
    </VeoCard>
    <h2 class="text-h2 mt-6">
      {{ t('applyTOMs') }}
    </h2>
    <p class="text-body-1">
      {{ t('selectDPEntitiesCTA') }}
    </p>
    <VeoCard>
      <VeoEntitySelectionList
        v-model="selectedEntities"
        :items="availableEntities"
        :loading="entitiesLoading"
        @page-change="onPageChange"
      />
    </VeoCard>
    <v-row
      dense
      class="mt-4"
    >
      <v-spacer />
      <v-col class="flex-grow-0 d-flex">
        <v-btn
          text
          class="mr-2"
          :disabled="selectedToms.length === 0 || applyingTOMs"
          @click="onAbort"
        >
          {{ t('global.button.cancel') }}
        </v-btn>
        <v-btn
          :disabled="applyingTOMs"
          text
          class="mr-2"
          @click="onAbortEntitySelection"
        >
          {{ t('global.button.previous') }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="selectedEntities.length === 0"
          depressed
          :loading="applyingTOMs"
          @click="applyTOMs"
        >
          {{ t('apply') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
  <div
    v-else
    class="d-flex flex-column align-center justify-center fill-height"
  >
    <v-img
      src="/images/defaultError.svg"
      max-height="300px"
      contain
    />
    <h2 class="text-h2">
      {{ t('somethingWentWrong') }}
    </h2>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useAsync, useContext, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { cloneDeep, upperFirst } from 'lodash';

import { IVeoCatalogSelectionListHeader } from '~/components/catalogs/VeoCatalogSelectionList.vue';
import { IVeoCatalogItem, IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { getSchemaEndpoint } from '~/plugins/api/schema';

enum CATALOG_STATE {
  CHOOSE_TOMS,
  CHOOSE_ENTITIES
}

export default defineComponent({
  props: {
    catalogItems: {
      type: Array as PropType<IVeoCatalogItem[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { t } = useI18n();
    const { $api, $config, $user } = useContext();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

    // Layout stuff
    const state = ref<CATALOG_STATE>(CATALOG_STATE.CHOOSE_TOMS);

    const onAbort = () => {
      selectedToms.value = [];
      onAbortEntitySelection();
    };

    // Choose toms
    const catalogTableHeaders = computed<IVeoCatalogSelectionListHeader[]>(() => [
      {
        filterable: true,
        sortable: true,
        text: t('objectlist.abbreviation').toString(),
        value: 'item.abbreviation',
        width: 150
      },
      {
        filterable: true,
        sortable: true,
        text: t('objectlist.name').toString(),
        value: 'item.title'
      },
      {
        filterable: true,
        sortable: false,
        text: t('objectlist.description').toString(),
        value: 'item.description'
      }
    ]);

    const selectedToms = ref<string[]>([]);
    const availableToms = computed(() =>
      props.catalogItems
        .filter((item) => item.tailoringReferences.length > 0)
        .map((item) => {
          const displayNameParts = (item.element.displayName as string).split(' ');
          const designator = displayNameParts.shift() as string;
          const abbreviation = displayNameParts.shift() as string;
          const title = displayNameParts.join(' ') as string;

          return { designator, abbreviation, title, id: item.id, description: item.description };
        })
    );

    const selectedTOMsFormatted = computed(() => availableToms.value.filter((tom) => selectedToms.value.includes(tom.id)));

    // Choose entities
    watch(
      () => state.value,
      (newValue, oldValue) => {
        if (newValue === CATALOG_STATE.CHOOSE_ENTITIES && oldValue === CATALOG_STATE.CHOOSE_TOMS) {
          fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
        }
      }
    );

    const selectedEntities = ref<{ id: string; type: string }[]>([]);
    const entitiesLoading = ref(false);

    const availableEntities = ref<IVeoPaginatedResponse<IVeoEntity[]>>([]);

    const fetchEntities = async (options) => {
      entitiesLoading.value = true;
      availableEntities.value = await $api.entity.fetchAll('process', options.page, {
        subType: 'PRO_DataProcessing',
        size: $user.tablePageSize,
        sortBy: options.sortBy,
        sortOrder: options.sortDesc ? 'desc' : 'asc'
      });
      entitiesLoading.value = false;
    };

    const onPageChange = (opts: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      fetchEntities({ page: opts.newPage, sortBy: opts.sortBy, sortDesc: !!opts.sortDesc });
    };

    const onAbortEntitySelection = () => {
      selectedEntities.value = [];
      state.value = CATALOG_STATE.CHOOSE_TOMS;
    };

    const schemas = useAsync(() => $api.schema.fetchAll());

    const applyingTOMs = ref(false);
    const applyTOMs = async () => {
      applyingTOMs.value = true;

      try {
        // Fetch incarnations for all selected toms
        const incarnations = await $api.unit.fetchIncarnations(selectedToms.value);

        // Add a reference for every selected entity to every incarnation
        for (const entity of selectedEntities.value) {
          const incarnationsToModify = cloneDeep(incarnations);
          for (const incarnation of incarnationsToModify.parameters) {
            incarnation.references = [
              {
                referencedElement: {
                  targetUri: `${$config.apiUrl}/${getSchemaEndpoint(schemas.value, entity.type)}/${entity.id}`
                },
                referenceType: incarnation.references[0].referenceType
              }
            ];
          }
          await $api.unit.updateIncarnations(incarnationsToModify);
          displaySuccessMessage(t('incarnationsApplied').toString());
          onAbort();
        }
      } catch (e: any) {
        displayErrorMessage(t('applyIncarnaionError').toString(), JSON.stringify(e.message || e));
      } finally {
        applyingTOMs.value = false;
      }
    };

    return {
      applyTOMs,
      applyingTOMs,
      availableEntities,
      availableToms,
      catalogTableHeaders,
      entitiesLoading,
      onAbort,
      onAbortEntitySelection,
      onPageChange,
      selectedEntities,
      selectedToms,
      selectedTOMsFormatted,
      state,

      CATALOG_STATE,
      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "apply": "apply",
    "applyIncarnaionError": "Couldn't apply TOMs.",
    "applyTOMs": "Apply TOMs",
    "incarnationsApplied": "TOMs were applied",
    "selectTOMs": "Select TOMs",
    "selectedTOMs": "Selected TOMs",
    "selectTOMCTA": "Please choose one or more technical organizational measures to apply",
    "selectDPEntitiesCTA": "Please choose data processes to apply the technical organizational measures to.",
    "somethingWentWrong": "something went wrong"
  },
  "de": {
    "apply": "anwenden",
    "applyIncarnaionError": "Die TOMs konnten nicht angewendet werden.",
    "applyTOMs": "TOMs anwenden",
    "incarnationsApplied": "TOMs wurden angewendet.",
    "selectTOMs": "TOMs auswählen",
    "selectedTOMs": "Ausgewählte TOMs",
    "selectTOMCTA": "Wählen Sie eine oder mehrere technische und organisatorische Maßnahmen aus, die angewendet werden sollen.",
    "selectDPEntitiesCTA": "Wählen Sie die Verarbeitungstätigkeiten aus, auf die die TOMs angewendet werden sollen.",
    "somethingWentWrong": "etwas ist schiefgelaufen"
  }
}
</i18n>