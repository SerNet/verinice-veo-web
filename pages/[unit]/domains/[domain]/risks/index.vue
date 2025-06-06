<!--
   - verinice.veo web
   - Copyright (C) 2025 jae
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
  <BasePage data-component-name="unit-domains-domain-risks-page">
    <v-skeleton-loader v-if="isLoadingDomain" type="table" />
    <UtilNotFoundError v-else has-dashboard-button />
  </BasePage>
</template>
<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { data: currentDomain, isLoading: isLoadingDomain } = useCurrentDomain();

const riskDefintionId = computed(() => {
  if (isLoadingDomain.value || !currentDomain.value?.riskDefinitions) {
    return;
  }
  const riskDefinitions = Object.keys(currentDomain.value?.riskDefinitions);
  return currentDomain.value?.riskDefinitions?.[riskDefinitions?.[0]]?.id;
});

watch(
  riskDefintionId,
  () => {
    if (!riskDefintionId.value || isLoadingDomain.value) {
      return;
    }

    return router.replace({
      name: 'unit-domains-domain-risks-definition',
      params: {
        ...route.params,
        definition: riskDefintionId.value
      }
    });
  },
  { immediate: true }
);
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
