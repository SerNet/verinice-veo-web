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
  <BasePage style="height: 100vh">
    <template #header>
      <div class="mt-8 mb-4 text-body-1">
        <div v-if="currentName && currentModule">
          <!-- Link back to Control-Object: to be changed when the IT-SA is done -->
          <nuxt-link :to="riskAffectedUrl('targetObject')">
            <v-icon size="small" start :icon="mdiArrowLeft" />
            {{ t('targetObject', { currentName }) }}
          </nuxt-link>

          <!-- Separator -->
          <div class="separator" />

          <!-- Second link -->
          <nuxt-link :to="riskAffectedUrl('targetModule')">
            {{ t('targetModule', { currentModule }) }}
            <v-icon size="small" start :icon="mdiArrowRight" />
          </nuxt-link>
        </div>
      </div>
    </template>

    <template #default>
      <ComplianceList @update:current-name="currentName = $event" @update:current-module="currentModule = $event" />
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-compliance';
</script>

<script setup lang="ts">
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const route = useRoute();
const { t } = useI18n();
const currentName = ref('');
const currentModule = ref('');
const riskAffectedUrl = (targetType: string) =>
  computed(() => {
    const objectTypeKey = route.query.type as keyof typeof VeoElementTypePlurals;
    const objectType = VeoElementTypePlurals[objectTypeKey];
    const riskAffected = route.query.riskAffected;

    if (!objectType || !riskAffected) {
      console.error('Invalid route parameters:', { objectType, riskAffected });
      return { name: ROUTE_NAME };
    }
    return targetType === 'targetObject' ?
        {
          name: OBJECT_DETAIL_ROUTE,
          params: {
            ...route.params,
            objectType,
            object: riskAffected,
            subType: '-'
          }
        }
      : {
          name: OBJECT_OVERVIEW_ROUTE,
          params: {
            ...route.params,
            objectType: 'controls',
            subType: 'CTL_Module'
          }
        };
  });
</script>

<i18n>
{
"de": {
  "targetObject": "Zielobjekt \"{currentName}\" bearbeiten",
  "targetModule": "Baustein \"{currentModule}\" bearbeiten"
},
"en": {
  "targetObject": "Edit target object \"{currentName}\"",
  "targetModule": "Edit module \"{currentModule}\""
}

}
</i18n>

<style lang="scss" scoped>
.separator {
  display: inline-block;
  width: 1px;
  height: 12px;
  margin: 0 8px;
  background-color: gray;
  vertical-align: middle;
}
</style>
