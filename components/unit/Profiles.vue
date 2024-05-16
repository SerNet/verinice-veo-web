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
    <template v-if="isLoadingProfiles" class="mb-4">
      <v-col cols="12">
        <VSkeletonLoader v-for="i in 5" :key="i" type="image" elevation="2" class="my-6" height="160px" />
      </v-col>
    </template>

    <BaseAlert
      :model-value="!profiles.length"
      class="mt-6 mb-4"
      flat
      no-close-button
      :title="t('hasNoProfilesTitle')"
      :type="VeoAlertType.INFO"
      style="width: max-content"
    >
      {{ t('hasNoProfilesBody') }}
    </BaseAlert>

    <v-radio-group v-model="selectedProfile" v-if="profiles.length">
      <v-col v-if="hasNoneOption">
        <RadioButton data-veo-test="profile-radio-btn-none" :profile="null" :label="t('noProfile')" />
      </v-col>

      <template v-if="profiles.length" v-for="profile in profiles">
        <BaseListItem :item="profile" :data-veo-test="`profile-${profile.name}`">
          <template #center-aside="{ item: profile }">
            <LanguageChip :lang="profile.language" />
          </template>

          <template #bottom-left="{ item: profile }">
            <DomainChip :domainName="profile.domainName" />
          </template>

          <template #prepend="{ item: profile }">
            <RadioButton :profile="profile" :isDisabled="isDisabled" />
          </template>
        </BaseListItem>
      </template>
    </v-radio-group>
  </v-row>
</template>

<script setup lang="ts">
import { mdiPuzzle, mdiWeb } from '@mdi/js';
import { VeoAlertType } from '~/types/VeoTypes';

import type { TVeoProfile } from '~/composables/profiles/useProfiles';
import type { TInlineComponent } from '~/types/utils';

interface Props {
  profiles: TVeoProfile[];
  isLoadingProfiles?: boolean;
  isApplyingProfile?: boolean;
  isAssociatingDomain?: boolean;
  isDisabled?: boolean;
  hasNoneOption?: boolean;
}
withDefaults(defineProps<Props>(), {
  isApplyingProfile: false,
  isAssociatingDomain: false,
  isLoadingProfiles: false,
  isDisabled: false,
  hasNoneOption: true
});

// Helper
const { t } = useI18n();
const { domainColorsByName } = useDomainColors();

// State
const selectedProfile = defineModel();

// Components
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
  props: ['profile', 'isDisabled'],
  emits: ['profileSelected'],
  template: `
    <v-radio
      data-veo-test="profile-radio-btn"
      :model-value="radio"
      :value="profile"
      :disabled="isDisabled"
    >
    </v-radio>
  `
};
</script>
<i18n>
{
  "en": {
    "isAssociatingDomain": "Associating Domain...",
    "isApplyingProfile": "Applying Profile...",
    "noProfile": "Do not apply any profile.",
    "hasNoProfilesTitle": "No profiles available",
    "hasNoProfilesBody": "Sorry, we cannot find any profiles.",
  },
  "de": {
    "isAssociatingDomain": "Verknüpfe Domäne...",
    "isApplyingProfile": "Wende Profil an...",
    "noProfile": "Kein Profil anwenden.",
    "hasNoProfilesTitle": "Keine Profile verfügbar",
    "hasNoProfilesBody": "Wir konnten leider keine Profile finden.",
  } }
</i18n>
