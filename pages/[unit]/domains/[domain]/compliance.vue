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

<template>
  <BasePage style="height: 100vh" :title="`${t('implementation')} (${containerControl?.name})`">
    <template #header>
      <div class="mt-8 mb-4 text-body-1">
        <v-btn
          v-if="currentModule"
          :to="currentModule.urlParams"
          variant="outlined"
          data-veo-test="compliance-list-go-to-btn"
        >
          {{ t('targetModule', { subType: currentModule.subType, currentModule: currentModule.name }) }}
        </v-btn>
      </div>
    </template>
    <template #default>
      <ComplianceList :container-control="containerControl" />
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-compliance';
</script>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuery } from '~/composables/api/utils/query';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

// Types
interface CurrentModule {
  name: string;
  subType: string;
  urlParams: {
    name: string;
    params: {
      objectType: string;
      subType: string;
      object?: string;
      [key: string]: string | undefined;
    };
  };
}

interface BreadcrumbItem {
  to: string;
  exact: boolean;
  index: number;
  text: string;
  indexToReplace?: number;
  disabled: boolean;
  dataVeoTest?: string;
}

// Composables
const route = useRoute();
const { t, locale } = useI18n();
const { data: currentDomain, isLoading } = useCurrentDomain();
const { clearCustomBreadcrumbs, addCustomBreadcrumb } = useVeoBreadcrumbs();

// Query Parameters
const targetObjectQueryParameters = computed(() => ({
  endpoint: VeoElementTypePlurals[route.query.type as keyof typeof VeoElementTypePlurals],
  id: route.query.targetObject as string,
  domain: route.params.domain as string
}));

const containerObjectQueryParameters = computed(() => ({
  endpoint: 'controls',
  id: route.query.control as string,
  domain: route.params.domain as string
}));

// Queries
const { data: targetObject } = useQuery(objectQueryDefinitions.queries.fetch, targetObjectQueryParameters);
const { data: containerControl } = useQuery(objectQueryDefinitions.queries.fetch, containerObjectQueryParameters, {
  enabled: !!route.query.control,
  keepPreviousData: false
});

// Computed Properties
const newSubType = computed(() => containerControl.value?.subType);
const ctModuleType = computed(() => containerControl.value?.type);

// SubType Translations
const { subTypeTranslation } = useSubTypeTranslation(ctModuleType, newSubType, false);
const { subTypeTranslation: ownerSubType } = useSubTypeTranslation(
  toRef(() => targetObject.value?.type),
  toRef(() => targetObject.value?.subType)
);

const currentModule = computed<CurrentModule | undefined>(() => {
  if (isLoading.value || !containerControl.value || !currentDomain.value) {
    return undefined;
  }

  const module = containerControl.value;
  return {
    name: module.name,
    subType: subTypeTranslation.value,
    urlParams: {
      name: OBJECT_DETAIL_ROUTE,
      params: {
        ...route.params,
        objectType: 'controls',
        subType: newSubType.value,
        object: module.id
      }
    }
  };
});

// Breadcrumbs Logic
const generateCustomBreadcrumbs = (unit: string, domain: string, subTypeTranslation: string): BreadcrumbItem[] => {
  if (!containerControl.value || !targetObject.value) {
    return [];
  }

  const typePlural = VeoElementTypePlurals[targetObject.value?.type as keyof typeof VeoElementTypePlurals];

  return [
    {
      to: `/${unit}/domains/${domain}/${typePlural}`,
      dataVeoTest: 'breadcrumb-item-targetObject-typePlural',
      exact: true,
      index: 2,
      text: typePlural,
      indexToReplace: 2,
      disabled: false
    },
    {
      to: `/${unit}/domains/${domain}/${typePlural}/${targetObject.value?.subType}`,
      dataVeoTest: 'breadcrumb-item-targetObject-subType',
      exact: true,
      index: 3,
      text: subTypeTranslation,
      disabled: false
    },
    {
      to: `/${unit}/domains/${domain}/${typePlural}/${targetObject.value?.subType}/${targetObject.value?.id}`,
      dataVeoTest: 'breadcrumb-item-targetObject-id',
      exact: true,
      index: 4,
      text: targetObject.value.displayName,
      disabled: false
    },
    {
      to: `/${unit}/domains/${domain}/${typePlural}/${containerControl.value?.subType}/${targetObject.value?.id}#controls`,
      dataVeoTest: 'breadcrumb-item-implementation-name',
      exact: true,
      index: 5,
      text: `${t('implementation')} (${containerControl.value.name})`,
      disabled: true
    }
  ];
};

const customCrumbs = computed(() => {
  if (!containerControl.value || !targetObject.value) return undefined;
  return generateCustomBreadcrumbs(route.params.unit as string, route.params.domain as string, ownerSubType.value);
});

// Lifecycle Hooks and Watchers
onMounted(() => {
  clearCustomBreadcrumbs();
  customCrumbs.value?.forEach((crumb) => addCustomBreadcrumb(crumb));
});

onBeforeRouteLeave(() => {
  clearCustomBreadcrumbs();
});

// Watchers
watch(() => route.fullPath, clearCustomBreadcrumbs);

watch([locale, customCrumbs], () => {
  clearCustomBreadcrumbs();
  customCrumbs.value?.forEach((crumb) => addCustomBreadcrumb(crumb));
});
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-compliance.json"></i18n>
