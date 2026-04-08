<!--
   - verinice.veo web
   - Copyright (C) 2024  jae
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
  <BasePage class="pt-6" data-component-name="unit-selection-page" sticky-footer>
    <BaseContainer>
      <UnitProfiles
        v-model="selectedProfile"
        :profiles="profiles ?? []"
        :is-associating-domain="isAssociatingDomain"
        :is-applying-profile="isApplyingProfile"
      />
    </BaseContainer>

    <template #footer>
      <div class="d-flex justify-space-between">
        <v-btn to="/units" size="large" class="my-6" data-veo-test="cancel-dialog">
          {{ globalT('global.button.cancel') }}
        </v-btn>
        <v-btn
          data-veo-test="apply-profile"
          :disabled="!canApplyProfile"
          color="primary"
          :prepend-icon="mdiShapeOutline"
          size="large"
          class="my-6"
          @click="initApplyProfile"
        >
          {{ t('applyProfiles') }}
        </v-btn>
      </div>
    </template>

    <!-- Info-Dialog: pops up if applying a profile requires associating a domain first -->
    <BaseDialog
      :close-function="() => (isDialogOpen = false)"
      :model-value="isDialogOpen"
      :title="t('userMessages.info.title')"
    >
      <template #default>
        <BaseCard>
          <v-card-text>
            {{ t('warningAssociateDomainBody') }}
          </v-card-text>
        </BaseCard>
      </template>
      <template #dialog-options>
        <v-btn flat variant="plain" @click="isDialogOpen = false">
          {{ t('global.button.cancel') }}
        </v-btn>
        <v-spacer />

        <v-btn
          flat
          color="primary"
          @click="
            isDialogOpen = false;
            wantsToAssociateNewDomain = true;
          "
        >
          {{ t('applyProfiles') }}
        </v-btn>
      </template>
    </BaseDialog>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'profiles';
</script>

<script setup lang="ts">
import { mdiShapeOutline } from '@mdi/js';
import type { TVeoProfile } from '~/composables/profiles/useProfiles';

// Helper
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { createLink } = useCreateLink();

// Data
const { data: currentUnit } = useUnit();
const { profiles } = useProfiles();

// State
const selectedProfile = ref<TVeoProfile | null>(null);
const canApplyProfile = computed(() => !!selectedProfile.value);
const wantsToAssociateNewDomain = ref(false);
const isDialogOpen = ref(false);

async function closeDialog() {
  return new Promise<void>((resolve) => {
    watch(
      () => isDialogOpen.value,
      () => {
        if (!isDialogOpen.value) resolve();
      }
    );
  });
}

// Mutate unit (associate domain + apply profile)
const unit = computed(() => {
  const domainId = profiles.value.find((p) => p.id === selectedProfile.value.id)?.domainId ?? '';
  if (!domainId) return { ...currentUnit.value?.raw };
  return {
    ...currentUnit.value?.raw,
    domains: [...(currentUnit.value?.raw.domains ?? []), createLink('domains', domainId)]
  };
});

const unitId = computed(() => currentUnit.value?.id ?? '');

const profile = computed(() => ({
  id: selectedProfile.value?.id ?? '',
  domainId: selectedProfile.value?.domainId ?? ''
}));

// Associate Domain if necessary
const { mutate: associateDomain, isPending: isAssociatingDomain, isSuccess, isError } = useUnitMutation(unit);

// Apply Profile
const {
  mutate: applyProfile,
  isPending: isApplyingProfile,
  isSuccess: isSuccessApplyProfile,
  isError: isErrorApplyProfile
} = useApplyProfile(unitId, profile);

const messagesAssociateDomain = computed(() => ({
  loading: t('isAssociatingDomain'),
  success: t('domainAssociatedSuccess'),
  error: { title: t('domainAssociatedError.title'), text: t('domainAssociatedError.text') }
}));

const messagesApplyProfile = computed(() => ({
  loading: t('isApplyingProfile'),
  success: t('applyProfileSuccess'),
  error: { title: t('applyProfileErrorTitle'), body: t('applyProfileErrorBody') }
}));

useUserFeedback({
  isLoading: isAssociatingDomain,
  isSuccess,
  isError,
  messages: messagesAssociateDomain
});

useUserFeedback({
  isLoading: isApplyingProfile,
  isSuccess: isSuccessApplyProfile,
  isError: isErrorApplyProfile,
  messages: messagesApplyProfile,
  callback: () =>
    useRouter().push({
      name: 'unit-domains-domain',
      params: {
        unit: unitId.value,
        domain: profile.value.domainId
      }
    })
});

async function initApplyProfile() {
  if (!currentUnit.value?.domains) return;

  const unitKnowsDomain = currentUnit.value.domains.map((d) => d.id).includes(selectedProfile.value?.domainId ?? '');

  if (!unitKnowsDomain) {
    isDialogOpen.value = true;
    await closeDialog();

    if (wantsToAssociateNewDomain.value) {
      associateDomain();
      await waitForBooleanToUpdate(isSuccess, true);
    }
  }
  applyProfile();
}

useHead({
  title: globalT('breadcrumbs.profiles')
});
</script>

<i18n src="~/locales/base/pages/units-unit-profiles.json"></i18n>
