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
        <v-btn to="/units" size="large" class="my-6">
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
import { useUpdateUnit, useApplyProfile } from '~/components/unit/unit-module';
import { mdiShapeOutline } from '@mdi/js';
import type { TVeoProfile } from '~/composables/profiles/useProfiles';

// Helper
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { applyProfile, isLoading: isApplyingProfile } = useApplyProfile();
const { update: updateUnit } = useUpdateUnit();
const { createLink } = useCreateLink();

const { setLoading, clearLoading } = useGlobalLoadingState();

// Data
const { data: currentUnit } = useCurrentUnit();
const { profiles } = useProfiles();

// State
const selectedProfile = ref<TVeoProfile | null>(null);

const canApplyProfile = computed(() => !!selectedProfile.value);
const wantsToAssociateNewDomain = ref(false);

const isDialogOpen = ref(false);
const isAssociatingDomain = ref(false);

const applyProfileParams = computed(() => ({
  profileId: selectedProfile?.value?.id,
  unitId: currentUnit.value?.id,
  domainId: selectedProfile.value?.domainId
}));

// Actions
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

async function initApplyProfile() {
  if (!currentUnit.value?.domains) return;

  const unitKnowsDomain = currentUnit.value.domains.map((d) => d.id).includes(selectedProfile.value?.domainId ?? '');

  if (!unitKnowsDomain) {
    isDialogOpen.value = true;
    await closeDialog();

    if (wantsToAssociateNewDomain.value) {
      const domainId = profiles.value.find((p) => p.id === selectedProfile.value.id)?.domainId ?? '';
      const unit = {
        ...currentUnit.value?.raw,
        domains: [...(currentUnit.value?.raw.domains ?? []), createLink('domains', domainId)]
      };
      const loadingId = setLoading(t('unit.isAssociatingDomain'));
      await updateUnit(unit, unitMessages.value);
      clearLoading(loadingId);
    }
  }

  const loadingId = setLoading(t('unit.isApplyingProfile'));
  // @ts-ignore TODO #3066 not assignable
  await applyProfile(applyProfileParams.value, messages.value);
  clearLoading(loadingId);
}

const messages = computed(() => ({
  success: t('applyProfileSuccess'),
  error: { title: t('applyProfileErrorTitle'), body: t('applyProfileErrorBody') }
}));

const unitMessages = computed(() => ({
  success: t('applyProfileSuccess'),
  error: { text: t('applyProfileErrorText') }
}));

useHead({
  title: globalT('breadcrumbs.profiles')
});
</script>

<i18n src="~/locales/base/pages/units-unit-profiles.json"></i18n>
