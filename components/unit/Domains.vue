<template>
  <LayoutLoadingWrapper v-if="isAssociatingDomains" :text="t('isAssociatingDomains')" />
  <v-row align="center" justify="center">
    <template v-if="!domains.length" class="mb-4">
      <v-col cols="12">
        <VSkeletonLoader v-for="i in 5" :key="i" type="image" elevation="2" class="my-6" height="160px" />
      </v-col>
    </template>

    <template v-if="domains.length" v-for="domain in domains">
      <BaseListItem :item="domain" :data-veo-test="`domain-${domain.name}`">
        <template #center-aside="{ item: domain }">
          <v-icon :color="domain.color" :icon="mdiPuzzle" />
        </template>
        <template #prepend="{ item: domain }">
          <v-checkbox
            color="primary"
            :value="domain"
            :disabled="isDisabled || domain.id === mandatoryDomain?.id"
            v-model="selected"
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

<i18n>
{
  "en": {
    "associateDomainsErrorTitle": "Error!",
    "associateDomainsErrorBody": "Domains could not be associated.",
    "associateDomainsSuccess": "Domains successfully associated.",
    "isAssociatingDomains": "Associating domains...",
  },
  "de": {
    "associateDomainsErrorTitle": "Fehler!",
    "associateDomainsErrorBody": "Domänen konnten nicht assoziiert werden.",
    "associateDomainsSuccess": "Domänen erfolgreich assoziert.",
    "isAssociatingDomains": "Assoziiere Domänen..."
  }
}
</i18n>
