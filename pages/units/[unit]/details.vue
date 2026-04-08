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
          :disabled="!canUpdate"
          :prepend-icon="mdiUpdate"
          @click="updateUnit"
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
import type { UnitDetails } from '~/components/unit/Details.vue';

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

// Set initial unit data
const { data: currentUnit, isLoading: isLoadingCurrentUnit } = useUnit();
const unitDetails = ref<UnitDetails>();
watch(
  currentUnit,
  (): void => {
    if (isLoadingCurrentUnit.value) return;

    unitDetails.value = {
      name: currentUnit.value?.name,
      description: currentUnit.value?.description
    };
  },
  { immediate: true }
);

// Data to be posted
const unit = computed(() => ({
  ...currentUnit.value?.raw,
  name: unitDetails.value?.name,
  description: unitDetails.value?.description
}));

// Mutation
const router = useRouter();

const messages = computed(() => ({
  success: t('unitUpdateSuccess'),
  error: { title: t('unitUpdateErrorTitle'), text: t('unitUpdateErrorBody') },
  loading: t('unit.isUpdatingDetails')
}));

const { mutate: updateUnit, isPending: isUpdatingUnit, isSuccess, isError } = useUnitMutation(unit);

useUserFeedback({
  isLoading: isUpdatingUnit,
  isSuccess,
  isError,
  messages,
  callback: () => router.push({ name: 'units' })
});

// Component state
const canUpdate = computed(() => {
  return !!unitDetails.value?.name?.trim() && !isLoadingCurrentUnit.value && !isUpdatingUnit.value;
});
</script>

<i18n src="~/locales/base/pages/units-unit-details.json"></i18n>
