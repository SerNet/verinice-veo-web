<!--
verinice.veo web
Copyright (C) 2024 jae

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BasePage class="pt-6" data-component-name="unit-selection-page" sticky-footer>
    <BaseContainer>
      <UnitDetails
        v-model="unitDetails"
        :is-loading-current-unit="isLoadingCurrentUnit"
        :is-updating-unit="isUpdatingUnit"
      />
    </BaseContainer>

    <template #footer>
      <div class="d-flex justify-space-between">
        <v-btn to="/units" size="large" class="my-6" data-veo-test="cancel-dialog">
          {{ globalT('global.button.cancel') }}
        </v-btn>
        <!-- @vue-ignore TODO #3066 not assignable -->
        <v-btn
          data-veo-test="associate-domains"
          color="primary"
          size="large"
          class="my-6"
          :disabled="canUpdate"
          :prepend-icon="mdiUpdate"
          @click="() => handleClick(unit as IVeoUnit, messages)"
        >
          {{ t('updateUnitDetails') }}
        </v-btn>
      </div>
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'units-unit-details';
</script>

<script setup lang="ts">
import { mdiUpdate } from '@mdi/js';
import { useUpdateUnit } from '~/components/unit/unit-module';
import type { UnitDetails } from '~/components/unit/Details.vue';
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';

// Helper
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { update, isLoading: isUpdatingUnit } = useUpdateUnit();

// State
const { data: currentUnit, isLoading: isLoadingCurrentUnit } = useCurrentUnit();

const { setLoading, clearLoading } = useGlobalLoadingState();

// Component state
const unitDetails = ref<UnitDetails>();
watch(isLoadingCurrentUnit, (): void => {
  if (isLoadingCurrentUnit.value) return;

  // unitDetails: set initial values
  unitDetails.value = {
    name: currentUnit.value?.name,
    description: currentUnit.value?.description
  };
});

// Data to be posted
const unit = computed(() => ({
  ...currentUnit.value?.raw,
  name: unitDetails.value?.name,
  description: unitDetails.value?.description
}));

const canUpdate = computed(() => {
  return !unitDetails.value?.name?.trim() || !isLoadingCurrentUnit || !isUpdatingUnit;
});

const messages = computed(() => ({
  success: t('unitUpdateSuccess'),
  error: { title: t('unitUpdateErrorTitle'), body: t('unitUpdateErrorBody') },
  loading: t('unit.isUpdatingDetails')
}));

//handel updateUnit and the loadingscreen
async function handleClick(unit, messages) {
  let loadId;
  try {
    loadId = setLoading(messages.loading);
    await update(unit as IVeoUnit, messages);
  } finally {
    clearLoading(loadId);
  }
}
</script>

<i18n src="~/locales/base/pages/units-unit-details.json"></i18n>
