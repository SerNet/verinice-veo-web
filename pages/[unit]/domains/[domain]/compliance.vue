<!--
   - verinice.veo web
   - Copyright (C) 2023 jae
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
‚
<template>
  <BasePage style="height: 100vh">
    <template #header>
      <div class="mt-8 mb-4 text-body-1">
        <div v-if="currentModule">
          <v-btn :to="currentModule.urlParams" variant="outlined">
            {{ t('targetModule', { currentModule: currentModule.name }) }}
            <v-icon size="small" :icon="mdiArrowRight" end />
          </v-btn>
        </div>
      </div>
    </template>

    <template #default>
      <ComplianceList />
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-compliance';
</script>

<script setup lang="ts">
import { mdiArrowRight } from '@mdi/js';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCompliance } from '~/components/compliance/compliance';
import { VeoElementTypesSingular } from '~/types/VeoTypes';
import type { ComplianceState } from '~/components/compliance/compliance';

const route = useRoute();
const { t } = useI18n();
const { state } = useCompliance();

const currentModule = computed(() => {
  const module = state.CTLModule.value;
  if (!module) return undefined;

  const params: { objectType: string; subType: string; object?: string } = {
    ...route.params,
    objectType: 'controls',
    subType: 'CTL_Module',
    object: module.id
  };

  return {
    name: module.name,
    urlParams: {
      name: OBJECT_DETAIL_ROUTE,
      params
    }
  };
});

/* BREADCRUMBS */
const { clearCustomBreadcrumbs, addCustomBreadcrumb } = useVeoBreadcrumbs();
const { subTypeTranslation } = useSubTypeTranslation(
  VeoElementTypesSingular[state.type.value as keyof typeof VeoElementTypesSingular],
  state.CTLModule.value?.owner.subType
);

const customCrumbs = computed(() => {
  if (!state.CTLModule.value) return undefined;
  return generateCustomBreadcrumbs(
    route.params.unit as string,
    route.params.domain as string,
    state,
    subTypeTranslation.value
  );
});

function generateCustomBreadcrumbs(unit: string, domain: string, state: ComplianceState, subTypeTranslation: string) {
  return [
    {
      to: `/${unit}/domains/${domain}/${state.type.value}`,
      exact: true,
      index: 2,
      text: state.type.value,
      indexToReplace: 2,
      disabled: false
    },
    {
      to: `/${unit}/domains/${domain}/${state.type.value}/${state.CTLModule.value.owner.subType}`,
      exact: true,
      index: 3,
      text: subTypeTranslation,
      disabled: false
    },
    {
      to: `/${unit}/domains/${domain}/${state.type.value}/${state.CTLModule.value.owner.subType}/${state.CTLModule.value.owner.id}`,
      exact: true,
      index: 4,
      text: state.CTLModule.value.owner.displayName,
      disabled: false
    },
    {
      to: `/${unit}/domains/${domain}/${state.type.value}/${state.CTLModule.value.owner.subType}/${state.CTLModule.value.owner.id}#controls`,
      exact: true,
      index: 5,
      text: `${t('implementation')} (${state.CTLModule.value.name})`,
      disabled: true
    }
  ];
}

onMounted(() => customCrumbs.value?.forEach((crumb) => addCustomBreadcrumb(crumb)));

// Remove breadcrumb on leaving route: otherwise they persist in other views
onBeforeRouteLeave(async () => clearCustomBreadcrumbs());

// Update breadcrumb if a filter is changed
watch(() => route.fullPath, clearCustomBreadcrumbs);

const { locale } = useI18n();
// Update breadcrumbs on changed locale
watch(locale, () => {
  clearCustomBreadcrumbs();
  customCrumbs.value?.forEach((crumb) => addCustomBreadcrumb(crumb));
});
</script>

<i18n>
{
"de": {
  "targetModule": "Baustein \"{currentModule}\" bearbeiten",
  "implementation": "Umsetzung"
},
"en": {
  "targetModule": "Edit module \"{currentModule}\"",
  "implementation": "Implementation"
}
}
</i18n>
