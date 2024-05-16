<template>
  <BasePage class="pt-6" data-component-name="unit-selection-page" sticky-footer>
    <BaseContainer>
      <UnitDomains v-model="selectedDomains" :domains="domains" :isAssociatingDomains="isAssociatingDomains" />
    </BaseContainer>

    <template #footer>
      <div class="d-flex justify-space-between">
        <v-btn to="/units" size="large" class="my-6">
          {{ globalT('global.button.cancel') }}
        </v-btn>
        <v-btn
          data-veo-test="associate-domains"
          color="primary"
          size="large"
          class="my-6"
          :prepend-icon="mdiPlus"
          :disabled="canAssociateDomains"
          @click="() => update(unit as IVeoUnit, messages)"
        >
          {{ t('associateDomains') }}
        </v-btn>
      </div>
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'units-domain-domains';
</script>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { useUpdateUnit } from '~/components/unit/unit-module';
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';

const { createLink } = useCreateLink();
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { update, isLoading: isAssociatingDomains } = useUpdateUnit();

// Data
const { domains } = useDomains();
const { data: currentUnit } = useCurrentUnit();

// State
const selectedDomains = ref([]);
const domainsToAssociate = computed(() =>
  selectedDomains.value.map((domain) => createLink('domains', domain.id) ?? [])
);
const canAssociateDomains = computed(() => !domainsToAssociate.value.length);

const unit = computed(() => ({
  ...(currentUnit.value?.raw ?? {}),
  domains: [...(currentUnit.value?.raw.domains ?? []), ...domainsToAssociate.value]
}));

const messages = computed(() => ({
  success: t('associateDomainsSuccess'),
  error: { text: t('associateDomainsErrorText') }
}));
</script>
<style scoped lang="scss"></style>
<i18n>
{
  "en": {
    "isAssociatingDomains": "Associating domains...",
    "associateDomainsErrorText": "Domains could not be associated.",
    "associateDomainsSuccess": "Domains successfully associated.",
    "associateDomains": "Associate domains"
  },
  "de": {
    "isAssociatingDomains": "Assoziiere Domänen...",
    "associateDomainsErrorText": "Domänen konnten nicht assoziiert werden.",
    "associateDomainsSuccess": "Domänen erfolgreich assoziert.",
    "associateDomains": "Domänen hinzufügen"
  }
}
</i18n>
