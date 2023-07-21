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
  <div>
    <p class="text-body-1">
      <slot name="header" />
    </p>
    <BaseCard>
      <BaseTable
        v-model="selectedItems"
        :items="availableItems"
        :additional-headers="headers"
        must-sort
        show-select
      />
    </BaseCard>
    <v-row
      dense
      class="mt-4"
    >
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          variant="text"
          class="mr-2"
          :disabled="selectedItems.length === 0 || applyingItems"
          @click="selectedItems = []"
        >
          {{ globalT('global.button.cancel') }}
        </v-btn>
        <v-btn
          flat
          color="primary"
          :disabled="selectedItems.length === 0 || applyingItems || ability.cannot('manage', 'catalogs')"
          :loading="applyingItems"
          @click="applyItems"
        >
          {{ t('apply') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { IVeoCatalogItem } from '~~/composables/api/queryDefinitions/catalogs';
import { useQuerySync } from '~~/composables/api/utils/query';
import unitQueryDefinitions from '~~/composables/api/queryDefinitions/units';
import { useMutation } from '~~/composables/api/utils/mutation';
import { TableHeader } from '../base/Table.vue';
import { IVeoEntity } from '~/types/VeoTypes';

const props = withDefaults(defineProps<{
  catalogItems: IVeoCatalogItem[];
  loading: boolean;
  successText: string;
  errorText: string;
}>(), {
  catalogItems: () => [],
  loading: false,
  successText: '',
  errorText: ''
});

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { ability } = useVeoPermissions();
const route = useRoute();

const { mutateAsync: incarnate } =  useMutation(unitQueryDefinitions.mutations.updateIncarnations);

// Selecting
const headers: TableHeader[] = [
  {
    value: 'abbreviation',
    key: 'abbreviation',
    sortable: true,
    truncate: true,
    width: 80,
    priority: 60,
    order: 30
  },
  {
    value: 'name',
    key: 'name',
    cellClass: ['font-weight-bold'],
    width: 600,
    truncate: true,
    sortable: true,
    priority: 100,
    order: 40
  },
  {
    value: 'description',
    key: 'description',
    sortable: false,
    width: 500,
    truncate: true,
    tooltip: ({ item }: { item: any }) => item.raw.description,
    priority: 30,
    order: 60
  }
];

const selectedItems = ref<IVeoEntity[]>([]);
const availableItems = computed(() =>
  props.catalogItems.map((item) => {
    const {namespace, abbreviation, name, id, description = '' } = item;
    return { designator: namespace, abbreviation, name, id, description } || ''
  })
);

// If the available items change (they shouldn't) only select the items that are still available.
watch(() => availableItems.value, (newValue) => {
  const newValues = selectedItems.value.filter((selectedItem) => newValue.some((item) => item.id === selectedItem.id));
  selectedItems.value = newValues;
});

// Applying
const applyingItems = ref(false);
const applyItems = async () => {
  applyingItems.value = true;

  try {
    // Fetch incarnations for all selected items
    const incarnations = await useQuerySync(unitQueryDefinitions.queries.fetchIncarnations, { unitId: route.params.unit as string, itemIds:
      selectedItems.value.map((item) => item.id) });

    // Apply incarnations
    await incarnate({ incarnations, unitId: route.params.unit });
    displaySuccessMessage(props.successText);
    selectedItems.value = [];
  } catch (e: any) {
    displayErrorMessage(props.errorText, e.message);
  } finally {
    applyingItems.value = false;
  }
};
</script>

<i18n>
{
  "en": {
    "apply": "apply"
  },
  "de": {
    "apply": "anwenden"
  }
}
</i18n>
