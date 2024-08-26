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
          <UnitDetails v-model="unitDetails" />
        </v-window-item>

        <v-window-item :value="2">
          <UnitProfiles
            v-model="selectedProfile"
            :profiles="profiles"
            :is-applying-profile="isApplyingProfile"
            :is-loading-profiles="isLoadingProfiles"
          />
        </v-window-item>

        <v-window-item :value="3">
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
        <v-btn v-if="step > 1" size="large" class="my-6" variant="outlined" @click="step--">{{
          globalT('global.button.back')
        }}</v-btn>
        <v-btn v-if="step === 1" to="/units" size="large" class="my-6" variant="outlined">{{
          t('goToUnitAdmin')
        }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="step < 4"
          data-veo-test="create-unit-next-btn"
          size="large"
          class="my-6"
          color="primary"
          variant="outlined"
          :disabled="!canClickNext"
          @click="step++"
          >{{ globalT('global.button.next') }}</v-btn
        >
        <v-btn
          v-if="step === 4"
          data-veo-test="create-unit-create-btn"
          size="large"
          class="my-6"
          color="primary"
          :prepend-icon="mdiPlus"
          @click="createUnit"
          >{{ t('createUnit') }}
        </v-btn>
      </div>
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-create';
</script>

<script setup lang="ts">
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { mdiPlus } from '@mdi/js';
import { VeoAlertType } from '~/types/VeoTypes';
import { useApplyProfile, redirectToUnits } from '~/components/unit/unit-module';

// Types
import type { TVeoProfile } from '~/composables/profiles/useProfiles';
import type { TVeoDomain } from '~/composables/domains/useDomains';
import type { UnitDetails } from '~/components/unit/Details.vue';

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
</script>
<i18n>
{
  "en": {
    "createUnit": "Create unit",
    "createUnitSuccess": "Unit was successfully created.",
    "createUnitErrorBody": "Could not create unit.",
    "enterUnitDetails": "Enter name and description",
    "chooseProfile": "Choose profile (optional)",
    "chooseDomains": "Choose domains",
    "goToUnitAdmin": "Back to Unit administration",
    "summary": "Summary",
    "isCreatingUnit": "Creating unit...",
    "applyProfiles": "Apply Profiles",
    "isApplyingProfile": "Applying profile...",
    "applyProfileSuccess": "Profile successfully applied.",
    "applyProfileErrorText": "Could not apply profile.",
    "preSelectedDomainTitle": "Pre-selected Domain",
    "preSelectedDomainBody": "Because you are importing objects from the profile { profile }, the domain { domain } is preselected."
  },
  "de": {
    "createUnit": "Unit anlegen",
    "createUnitSuccess": "Unit wurde erfolgreich angelegt.",
    "createUnitErrorBody": "Unit konnte nicht angelegt werden.",
    "enterUnitDetails": "Namen und Beschreibung eingeben",
    "chooseProfile": "Profil auswählen (optional)",
    "chooseDomains": "Domänen auswählen",
    "goToUnitAdmin": "Zurück zur Unit-Verwaltung",
    "summary": "Zusammenfassung",
    "isCreatingUnit": "Erstelle Unit...",
    "applyProfiles": "Profile anwenden",
    "isApplyingProfile": "Wende Profil an...",
    "applyProfileSuccess": "Das Profil wurde erfolgreich angewendet.",
    "applyProfileErrorText": " Das Profil konnte nicht angewendet werden.",
    "preSelectedDomainTitle": "Pre-selected Domain",
    "preSelectedDomainBody": "Weil Sie Objekte aus dem Profil { profile } importieren, ist die Domäne { domain } vorausgewählt."
  }
}
</i18n>
<style scoped lang="scss">
#unit-create-wizard {
  :deep(.v-window-item) {
    margin: 16px;
  }
}
</style>
