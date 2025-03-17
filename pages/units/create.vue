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
  <BasePage
    id="unit-create-wizard"
    class="pt-6"
    data-component-name="unit-create-wizard"
    data-veo-test="unit-create-wizard"
    sticky-footer
  >
    <BaseContainer>
      <LayoutLoadingWrapper
        v-if="isCreatingUnit || isApplyingProfile"
        :text="isCreatingUnit ? t('isCreatingUnit') : t('isApplyingProfile')"
      />

      <v-stepper v-model="step" style="width: 100%">
        <v-stepper-header>
          <v-stepper-item :title="t('enterUnitDetails')" :value="1"></v-stepper-item>
          <v-divider></v-divider>

          <v-stepper-item :title="t('chooseProfile')" :value="2"></v-stepper-item>
          <v-divider></v-divider>

          <v-stepper-item :title="t('chooseDomains')" :value="3"></v-stepper-item>
          <v-divider></v-divider>

          <v-stepper-item :title="t('summary')" :value="4"></v-stepper-item>
        </v-stepper-header>
      </v-stepper>

      <v-window v-model="step" class="my-6" style="width: 100%">
        <v-window-item :value="1">
          <Description step="name" />
          <UnitDetails v-model="unitDetails" />
        </v-window-item>

        <v-window-item :value="2">
          <Description step="profile" />
          <UnitProfiles
            v-model="selectedProfile"
            :profiles="profiles"
            :is-applying-profile="isApplyingProfile"
            :is-loading-profiles="isLoadingProfiles"
          />
        </v-window-item>

        <v-window-item :value="3">
          <Description step="domain" />
          <BaseAlert
            :model-value="!!mandatoryDomain"
            class="mt-6 mb-4"
            flat
            no-close-button
            :title="t('preSelectedDomainTitle')"
            :type="VeoAlertType.INFO"
          >
            <i18n-t tag="div" keypath="preSelectedDomainBody">
              <template #profile>
                <strong>
                  {{ selectedProfile?.name }}
                </strong>
              </template>
              <template #domain>
                <strong>
                  {{ mandatoryDomain?.name }}
                </strong>
              </template>
            </i18n-t>
          </BaseAlert>
          <!-- @vue-ignore TODO #3066 not assignable -->
          <UnitDomains v-model="selectedDomains" :mandatory-domain="mandatoryDomain" :domains="domains" />
        </v-window-item>

        <!-- Overview -->
        <v-window-item :value="4">
          <Description step="summary" />
          <UnitDetails v-model="unitDetails" :is-disabled="true" />
          <!-- @vue-ignore TODO #3066 not assignable -->
          <UnitDomains v-model="selectedDomains" :domains="selectedDomains" :is-disabled="true" />
          <UnitProfiles
            v-if="selectedProfile"
            v-model="selectedProfile"
            :profiles="[selectedProfile]"
            :is-loading-profiles="isLoadingProfiles"
            :is-disabled="true"
            :has-none-option="false"
          />
        </v-window-item>
      </v-window>
    </BaseContainer>

    <template #footer>
      <div class="d-flex justify-space-between">
        <v-btn v-if="step > 1" size="large" class="my-6" variant="outlined" @click="handleBackClick">
          <h1 style="font-size: unset;">{{ globalT('global.button.back') }}</h1>
        </v-btn>

        <v-btn v-if="step === 1" to="/units" size="large" class="my-6" variant="outlined" @click="blurActiveElement">
          {{ t('goToUnitAdmin') }}
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          v-if="step < 4"
          data-veo-test="create-unit-next-btn"
          size="large"
          class="my-6"
          color="primary"
          variant="outlined"
          :disabled="!canClickNext"
          @click="handleNextClick"
        >
          {{ globalT('global.button.next') }}
        </v-btn>

        <v-btn
          v-if="step === 4"
          data-veo-test="create-unit-create-btn"
          size="large"
          class="my-6"
          color="primary"
          :prepend-icon="mdiPlus"
          @click="handleCreateClick"
        >
          {{ t('createUnit') }}
        </v-btn>
      </div>
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-create';
</script>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { redirectToUnits, useApplyProfile } from '~/components/unit/unit-module';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { VeoAlertType } from '~/types/VeoTypes';

// Types
import type { UnitDetails } from '~/components/unit/Details.vue';
import type { TVeoDomain } from '~/composables/domains/useDomains';
import type { TVeoProfile } from '~/composables/profiles/useProfiles';
import { TInlineComponent } from '~/types/utils';

// Helper
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
const { createLink } = useCreateLink();
const { ability } = useVeoPermissions();
const { applyProfile, isLoading: isApplyingProfile } = useApplyProfile();

// Data
const { data: domains } = useDomains();
const { profiles, isLoading: isLoadingProfiles } = useProfiles();

// State
const step = ref(1);
const hasRightToCreateUnits = computed(() => ability.value.can('manage', 'units'));

const unitDetails = ref<UnitDetails>({ name: '' });

const selectedProfile = ref<TVeoProfile | null>(null);

const mandatoryDomain = computed<TVeoDomain>(() => {
  if (!selectedProfile.value) return;
  return domains.value.find((d) => d.id === selectedProfile.value?.domainId);
});

const selectedDomains = ref<TVeoDomain[]>([]);

watch(
  mandatoryDomain,
  (newVal, oldVal) => {
    if (newVal) {
      // return, if domain is already in `selectedDomains`
      if (selectedDomains.value.some((d) => d.id === newVal.id)) return;
      selectedDomains.value.push(newVal);
      return;
    }
    selectedDomains.value = selectedDomains.value.filter((d) => d.id !== oldVal[0]?.id);
  },
  { immediate: true }
);

const unitParameters = computed(() => ({
  name: unitDetails.value.name,
  description: unitDetails.value.description ?? '',
  domains: selectedDomains.value.map((domain: TVeoDomain) => createLink('domains', domain.id) ?? [])
}));

const canClickNext = computed(() => {
  if (!hasRightToCreateUnits) return false;
  if (step.value === 1) return !!unitDetails.value.name;
  if (step.value === 3) return !!selectedDomains.value.length;
  return true;
});

// Actions
const {
  mutateAsync: create,
  isLoading: isCreatingUnit,
  data: createResponse
} = useMutation(unitQueryDefinitions.mutations.create);

async function createUnit() {
  if (!canClickNext) {
    return;
  }

  try {
    await create(unitParameters);

    if (selectedProfile.value && createResponse.value?.success) {
      const profileParams = {
        unitId: createResponse.value.resourceId,
        domainId: selectedProfile.value.domainId,
        profileId: selectedProfile.value.id
      };

      // New unit with a profile
      displaySuccessMessage(t('createUnitSuccess'));
      await applyProfile(profileParams, messages.value);
      return;
    }

    // New unit without a profile
    redirectToUnits();
    displaySuccessMessage(t('createUnitSuccess'));
  } catch (error: any) {
    displayErrorMessage({ text: t('createUnitErrorText') });
  }
}

// Pass these messages to `applyProfile` to display user messages
const messages = computed(() => ({
  success: t('applyProfileSuccess'),
  error: { text: t('applyProfileError') }
}));

// Description field providing assistance for unit creation
const Description: TInlineComponent = {
  props: ['step'],
  data: () => ({ t }),
  template: `
  <v-card class="my-3">
      <v-alert
  type="info"
  variant="tonal"
  :title="t(\`explanation.\${this.step}\`)"
  :text="t(\`hint.\${this.step}\`)"
></v-alert>
    </v-card>
  `
};
// Event listener for Enter key
function handleBackClick() {
  step.value--;
  blurActiveElement();
}
function handleNextClick() {
  if (canClickNext) {
    step.value++;
  }
  blurActiveElement();
}
function handleCreateClick() {
  createUnit();
  blurActiveElement();
}
function blurActiveElement() {
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement) {
    activeElement.blur();
  }
}
const handleEnterPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (canClickNext.value && step.value < 4) {
      step.value++;
    } else if (step.value === 4) {
      createUnit();
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEnterPress);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEnterPress);
});
</script>

<i18n src="~/locales/base/pages/units-create.json"></i18n>

<style scoped lang="scss">
#unit-create-wizard {
  :deep(.v-window-item) {
    margin: 16px;
  }
}
</style>
