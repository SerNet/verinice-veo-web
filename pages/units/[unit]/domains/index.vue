<!--
   - verinice.veo web
   - Copyright (C) 2024 Aziz Khalledi
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BasePage :title="pageTitle" class="pt-6" data-component-name="domain-selection-page" sticky-footer>
    <BaseContainer>
      <UnitDomains v-model="selectedDomains" :domains="domains" :is-associating-domains="isUpdatingUnit" />
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
          @click="updateUnit"
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
import type { IVeoUnit } from '~/composables/requests/useUnits';

const { createLink } = useCreateLink();
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

// Data
const { data: domains } = useDomains();
const { data: currentUnit } = useUnit();

// State
const pageTitle = computed(() => {
  return `[${currentUnit.value?.raw?.name || ''}] - ${t('domainSelection')}`;
});
const selectedDomains = ref([]);
const domainsToAssociate = computed(() =>
  selectedDomains.value.map((domain) => createLink('domains', domain.id) ?? [])
);
const canAssociateDomains = computed(() => !domainsToAssociate.value.length);

// Associate domains
const unit = computed(
  () =>
    ({
      ...(currentUnit.value?.raw ?? {}),
      domains: [...(currentUnit.value?.raw.domains ?? []), ...domainsToAssociate.value]
    }) as IVeoUnit
);

const messages = computed(() => ({
  success: t('associateDomainsSuccess'),
  error: { title: t('associateDomainsErrorText') },
  loading: t('unit.isAssociatingDomains')
}));

const { mutate: updateUnit, isPending: isUpdatingUnit, isSuccess, isError } = useUnitMutation(unit);

const router = useRouter();
useUserFeedback({
  isLoading: isUpdatingUnit,
  isSuccess,
  isError,
  messages,
  callback: () => router.back()
});
</script>

<i18n src="~/locales/base/pages/units-unit-domains.json"></i18n>
<style scoped lang="scss"></style>
