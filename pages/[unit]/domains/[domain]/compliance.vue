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
        <div v-if="currentName && currentModule">
          <!-- Link back to Control-Object: to be changed when the IT-SA is done -->
          <nuxt-link v-if="objectType && riskAffected" :to="riskAffectedUrl">
            <v-icon size="small" start :icon="mdiArrowLeft" />
            {{ t('targetObject', { currentName }) }}
            <!-- Separator -->
            <div class="separator" />
          </nuxt-link>

          <!-- Second link -->
          <nuxt-link :to="moduleUrl">
            {{ t('targetModule', { currentModule }) }}
            <v-icon size="small" start :icon="mdiArrowRight" />
          </nuxt-link>
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
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { useCompliance } from '~/components/compliance/compliance';

const route = useRoute();
const { t } = useI18n();
const currentName = ref('');
const currentModule = ref('');
const { state } = useCompliance();
const objectType = computed(() => state.type.value);
const riskAffected = computed(() => state.riskAffected.value);

const riskAffectedUrl = computed(() => {
  return {
    name: OBJECT_DETAIL_ROUTE,
    params: {
      ...route.params,
      objectType: objectType.value,
      object: riskAffected.value,
      subType: '-'
    },
    hash: '#controls'
  };
});

const moduleUrl = computed(() => {
  const controlValue = state.control.value;

  const params: { objectType: string; subType: string; object?: string } = {
    ...route.params,
    objectType: 'controls',
    subType: 'CTL_Module'
  };

  if (controlValue) {
    params.object = controlValue;
  }

  return {
    name: OBJECT_DETAIL_ROUTE,
    params
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
