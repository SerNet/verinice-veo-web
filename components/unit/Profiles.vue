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
  <v-row align="center" justify="center">
    <template v-if="isLoadingProfiles">
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
    <v-radio-group v-if="profiles.length" v-model="selectedProfile">
      <v-col v-if="hasNoneOption" cols="12" class="flex-1-1-100">
        <RadioButton
          data-veo-test="profile-radio-btn-none"
          :profile="null"
          :label="t('noProfile')"
          :aria-label="t('noProfile')"
        />
      </v-col>

      <template v-for="profile in profiles" :key="profile.id">
        <BaseListItem :item="profile" :data-veo-test="`profile-${profile.productId}`">
          <template #center-aside="{ item: p }">
            <LanguageChip :lang="p.language" />
          </template>

          <template #bottom-left="{ item: p }">
            <DomainChip :domain-id="p.domainId" />
          </template>

          <template #prepend="{ item: p }">
            <RadioButton
              :data-veo-test="`profile-radio-btn-${p.productId}`"
              :profile="p"
              :is-disabled="isDisabled"
              :aria-label="`${p.domainName}`"
            />
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
const { t, locale } = useI18n();
const { data: allDomains } = useDomains();
// State
const selectedProfile = defineModel<TVeoProfile>();

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
  props: ['domainId'],
  data: () => ({ mdiPuzzle, useDomainColor, allDomains, locale }),

  // This computed property replaces each domain with its matching full domain from allDomains based on id.
  computed: {
    renderedDomain(): any[] {
      const allDomainsArray = Array.isArray(this.allDomains) ? this.allDomains : [];
      const fullDomain = allDomainsArray.find((ad: any) => ad.id === this.domainId);
      return fullDomain;
    }
  },
  template: `
    <v-chip
      label
      :prepend-icon="mdiPuzzle"
      variant="outlined"
      size="small"
       :color="useDomainColor(renderedDomain?.translations?.[locale]?.name)"
    >
      {{ renderedDomain?.translations?.[locale]?.name ||  renderedDomain?.name}} 
    </v-chip>
  `
};

const RadioButton: TInlineComponent = {
  props: ['profile', 'isDisabled', 'dataVeoTest'],
  emits: ['profileSelected'],
  template: `
    <v-radio
      :id="profile?.id"
      :data-veo-test="dataVeoTest"
      :value="profile"
      :disabled="isDisabled"
    >
    </v-radio>
  `
};
</script>

<i18n src="~/locales/base/components/unit-profiles.json"></i18n>
