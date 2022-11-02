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
    <VeoCard>
      <VeoCatalogSelectionList
        v-model="selectedItems"
        :items="availableItems"
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
          :disabled="selectedItems.length === 0 || applyingItems"
          @click="selectedItems = []"
        >
          {{ t('global.button.cancel') }}
        </v-btn>
        <v-btn
          depressed
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

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoCatalogSelectionListHeader } from '~/components/catalogs/VeoCatalogSelectionList.vue';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { IVeoCatalogItem } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    catalogItems: {
      type: Array as PropType<IVeoCatalogItem[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    successText: {
      type: String,
      default: undefined
    },
    errorText: {
      type: String,
      default: undefined
    }
  },
  setup(props) {
    const { t } = useI18n();
    const { $api } = useContext();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
    const { ability } = useVeoPermissions();

    // Selecting
    const catalogTableHeaders = computed<IVeoCatalogSelectionListHeader[]>(() => [
      {
        sortable: true,
        text: t('objectlist.abbreviation').toString(),
        value: 'item.abbreviation',
        width: 150
      },
      {
        sortable: true,
        text: t('objectlist.name').toString(),
        value: 'item.title'
      },
      {
        sortable: false,
        text: t('objectlist.description').toString(),
        value: 'item.description'
      }
    ]);

    const selectedItems = ref<string[]>([]);
    const availableItems = computed(() =>
      props.catalogItems.map((item) => {
        const displayNameParts = (item.element.displayName as string).split(' ');
        const designator = displayNameParts.shift() as string;
        const abbreviation = displayNameParts.shift() as string;
        const title = displayNameParts.join(' ') as string;

        return { designator, abbreviation, title, id: item.id, description: item.description };
      })
    );

    // Applying
    const applyingItems = ref(false);
    const applyItems = async () => {
      applyingItems.value = true;

      try {
        // Fetch incarnations for all selected items
        const incarnations = await $api.unit.fetchIncarnations(selectedItems.value);
        // Apply incarnations
        await $api.unit.updateIncarnations(incarnations);
        displaySuccessMessage(props.successText);
        selectedItems.value = [];
      } catch (e: any) {
        displayErrorMessage(props.errorText, e.message);
      } finally {
        applyingItems.value = false;
      }
    };

    return {
      ability,
      applyingItems,
      applyItems,
      availableItems,
      catalogTableHeaders,
      selectedItems,

      t
    };
  }
});
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