<template>
  <LayoutLoadingWrapper v-if="isAssociatingDomains" :text="t('isAssociatingDomains')" />
  <v-row align="center" justify="center">
    <template v-if="!domains.length">
      <v-col cols="12">
        <VSkeletonLoader v-for="i in 5" :key="i" type="image" elevation="2" class="my-6" height="160px" />
      </v-col>
    </template>

    <template v-for="domain in domains" v-else :key="domain.id">
      <BaseListItem :item="domain" :data-veo-test="`domain-${domain.name}`">
        <template #center-aside="{ item: d }">
          <v-icon :color="d.color" :icon="mdiPuzzle" />
        </template>
        <template #prepend="{ item: d }">
          <v-checkbox
            v-model="selected"
            :data-veo-test="`domain-card-checkbox-${d?.abbreviation ? d.abbreviation.toLowerCase() : ''}`"
            color="primary"
            :value="d"
            :aria-label="`domain-${domain.name}`"
            :disabled="isDisabled || d.id === mandatoryDomain?.id"
          ></v-checkbox>
        </template>
      </BaseListItem>
    </template>
  </v-row>
</template>

<script setup lang="ts">
import { mdiPuzzle } from '@mdi/js';
import type { TVeoDomain } from '~/composables/domains/useDomains';
const { t } = useI18n();

interface Props {
  domains: readonly TVeoDomain[];
  isAssociatingDomains?: boolean;
  isDisabled?: boolean;
  mandatoryDomain?: TVeoDomain;
}

withDefaults(defineProps<Props>(), {
  isAssociatingDomains: false,
  isDisabled: false,
  mandatoryDomain: undefined
});

// State
const selected = defineModel<string[]>();
</script>

<i18n src="~/locales/base/components/unit-domains.json"></i18n>
