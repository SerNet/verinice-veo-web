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
  <LayoutLoadingWrapper
    v-if="isApplyingProfile || isAssociatingDomain"
    :text="isApplyingProfile ? t('isApplyingProfile') : t('isAssociatingDomain')"
  />
  <v-row align="center" justify="center">
    <template v-if="!profiles.length" class="mb-4">
      <v-col cols="12">
        <VSkeletonLoader v-for="i in 5" :key="i" type="image" elevation="2" class="my-6" height="160px" />
      </v-col>
    </template>

    <template v-if="profiles.length" v-for="profile in profiles">
      <BaseListItem :item="profile" :data-veo-test="`profile-${profile.name}`">
        <template #center-aside="{ item: profile }">
          <LanguageChip :lang="profile.language" />
        </template>

        <template #bottom-left="{ item: profile }">
          <DomainChip :domainName="profile.domainName" />
        </template>

        <template #prepend="{ item: profile }">
          <RadioButton :radio="radio" @profileSelected="() => selectProfile(profile)" />
        </template>
      </BaseListItem>
    </template>
  </v-row>

  <BaseDialog
    :close-function="() => (isDialogOpen = false)"
    :model-value="isDialogOpen"
    :title="t('warningAssociateDomainTitle')"
  >
    <template #default>
      <BaseCard>
        <v-card-text>
          {{ t('warningAssociateDomainBody') }}
        </v-card-text>
      </BaseCard>
    </template>
    <template #dialog-options>
      <v-btn @click="isDialogOpen = false" flat variant="plain">
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />

      <v-btn flat color="primary" @click="associateDomainAndApplyProfile">
        {{ t('global.button.ok') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
import { mdiPuzzle, mdiWeb } from '@mdi/js';

import type { TVeoProfile } from '~/composables/profiles/useProfiles';
import type { TInlineComponent } from '~/types/utils';

const { profiles: veoProfiles } = useProfiles();
const { data: currentUnit } = useCurrentUnit();
const { domainColorsByName } = useDomainColors();
const { domains } = useDomains();

const { t } = useI18n();

const radio = ref<TVeoProfile | null>(null);

function selectProfile(profile: TVeoProfile) {
  radio.value = profile;
}

const profiles = computed(() => veoProfiles.value ?? []);

const LanguageChip: TInlineComponent = {
  props: ['lang'],
  data: () => ({ mdiWeb }),
  template: `
    <v-chip
      :prepend-icon="mdiWeb"
      variant="flat"
      size="x-small"
    >
      {{ lang }}
    </v-chip>
  `
};

import { useMutation } from '~/composables/api/utils/mutation';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';

const { mutateAsync: applyProfileToUnit } = useMutation(domainQueryDefinitions.mutations.applyProfile);
const { mutateAsync: associateDomainToUnit } = useMutation(unitQueryDefinitions.mutations.update);

const applyProfileParams = computed(() => ({
  profileId: radio?.value?.id,
  unitId: currentUnit.value?.id,
  domainId: radio.value?.domainId
}));

const isDialogOpen = ref(false);
const isApplyingProfile = ref(false);
const isAssociatingDomain = ref(false);

async function associateDomainAndApplyProfile() {
  isDialogOpen.value = false;
  isAssociatingDomain.value = true;
  try {
    if (!currentUnit.value) return;
    await associateDomainToUnit({
      ...currentUnit.value?.raw,
      domains: [
        ...currentUnit.value.raw.domains,
        { targetUri: domains.value.find((d) => d.id === radio.value?.domainId)?.raw._self }
      ]
    });
  } catch (error) {
    console.error(error);
    return;
  } finally {
    isAssociatingDomain.value = false;
  }

  await applyProfile();
}

async function applyProfile({ profileId, unitId, domainId } = applyProfileParams.value) {
  try {
    isApplyingProfile.value = true;
    await applyProfileToUnit({ domainId, unitId, profileId });
    displaySuccessMessage(t('applyProfileSuccess'));
    if (typeof unitId === 'string' && typeof domainId === 'string') {
      redirectToUnit({ unitId, domainId });
    }
  } catch (error) {
    displayErrorMessage(t('applyProfileErrorTitle'), t('applyProfileErrorBody'));
  } finally {
    isApplyingProfile.value = false;
  }
}

async function initApplyProfile() {
  if (!currentUnit.value?.associatedDomains) return;
  const unitKnowsDomain = currentUnit.value.associatedDomains.includes(radio.value?.domainId ?? '');

  if (!unitKnowsDomain) {
    isDialogOpen.value = true;
    return;
  }
  await applyProfile();
}

function redirectToUnit({ unitId, domainId }: { unitId: string; domainId: string }) {
  const router = useRouter();
  if (!domainId || !unitId) return;
  router.push({
    name: 'unit-domains-domain',
    params: {
      unit: unitId,
      domain: domainId
    }
  });
}

defineExpose({
  applyProfile: initApplyProfile,
  canApplyProfile: computed(() => !!radio.value)
});

/* COMPONENTS */
const DomainChip: TInlineComponent = {
  props: ['domainName'],
  data: () => ({ mdiPuzzle, domainColorsByName }),
  template: `
    <v-chip
      :prepend-icon="mdiPuzzle"
      variant="outlined"
      size="small"
      :color="domainColorsByName[domainName]"
    >
      {{ domainName }}
    </v-chip>
  `
};

const RadioButton: TInlineComponent = {
  props: ['radio', 'profileId'],
  emits: ['profileSelected'],
  methods: {
    emitProfileSelected() {
      (this as any).$emit('profileSelected');
    }
  },
  template: `
    <v-radio
      data-veo-test="profile-radio-btn"
      :model-value="radio"
      :value="profileId"
      @click="emitProfileSelected">
    </v-radio>
  `
};
</script>

<style scoped lang="scss"></style>

<i18n>
{
  "en": {
    "warningAssociateDomainTitle": "Warning!",
    "warningAssociateDomainBody": "Action cannot be reversed. Applying this profile requires associating a new domain with your unit. This cannot be undone!",
    "applyProfileSuccess": "Profile successfully applied.",
    "applyProfileErrorTitle": "Sorry, an error occurred.",
    "applyProfileErrorBody": "Could not apply profile.",
    "isAssociatingDomain": "Associating Domain...",
    "isApplyingProfile": "Applying Profile...",

  },
  "de": {
    "warningAssociateDomainTitle": "Warnung!",
    "warningAssociateDomainBody": " Aktion kann nicht rückgängig gemacht werden. Die Anwendung dieses Profils erfordert die Verknüpfung einer neuen Domäne mit Ihrer Unit. Dies kann nicht rückgängig gemacht werden!",
    "applyProfileSuccess": "Das Profil wurde erfolgreich angewendet.",
    "applyProfileErrorTitle": "Entschuldigung, es ist ein Fehler aufgetreten.",
    "applyProfileErrorBody": " Das Profil konnte nicht angewendet werden.",
    "isAssociatingDomain": "Verknüpfe Domäne...",
    "isApplyingProfile": "Wende Profil an...",
  } }
</i18n>
