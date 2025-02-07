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
  <v-row data-component-name="risk-matrix-wrapper">
    <BaseContainer>
      <v-row v-if="!domainIsFetching">
        <v-col cols="12">
          <!-- Kriterien -->
          <h1>{{ t('criterion') }}</h1>
          <v-row v-for="(protectionGoal, index) in protectionGoals" :key="index">
            <RiskCriterion
              v-bind="getMatrixData(protectionGoal.id)"
              :protection-goal-id="protectionGoal.id"
              :title="protectionGoal.text"
              @edit="
                () =>
                  setUpEditing({
                    type: 'potentialImpacts',
                    items: getMatrixData(protectionGoal.id).impacts,
                    typeTranslation: t('potentialImpacts'),
                    riskCategoryId: protectionGoal.id
                  })
              "
            />
          </v-row>
          <v-row>
            <v-col>
              <v-card>
                <div class="d-flex my-4 pb-4">
                  <!-- Risikokategorien -->
                  <RiskLegends
                    :get-most-contrasty-color="getMostContrastyColor"
                    :title="t('riskValues')"
                    :items="riskValues"
                    @edit="
                      () =>
                        setUpEditing({
                          type: 'riskValues',
                          items: riskValues,
                          typeTranslation: t('riskValues')
                        })
                    "
                  />
                  <RiskLegends
                    :get-most-contrasty-color="getMostContrastyColor"
                    :title="t('probability')"
                    :items="probabilities"
                    @edit="
                      () =>
                        setUpEditing({
                          type: 'probability',
                          items: probabilities,
                          typeTranslation: t('probability')
                        })
                    "
                  />
                </div>
              </v-card>
            </v-col>
          </v-row>
          <!-- Neues Kriterium -->
          <v-row class="d-none">
            <v-col cols="12">
              <div class="px-4 pb-4">
                <v-btn class="dashed-border text-center elevation-1" outlined block> + {{ t('Newcriterion') }}</v-btn>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-skeleton-loader v-else data-veo-test="loader" type="image" width="600px" />
    </BaseContainer>

    <RiskDefinitionEditor
      v-model:is-open="hasEditor"
      v-model:is-dirty="editorIsDirty"
      v-model:form="riskDefinitionPart"
      @update-risk-definition="() => updateRiskDefinition({ riskDefinitionPart })"
    />
  </v-row>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-risks-matrix';
</script>

<script setup lang="ts">
import { cloneDeep, isEqual } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import RiskCriterion from '~/components/risk/riskElements/RiskCriterion.vue';
import RiskLegends from '~/components/risk/riskElements/RiskLegends.vue';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { useQuery } from '~/composables/api/utils/query';

import { createNewRiskDefinition, getRiskDefinition } from '~/components/risk/RiskDefinitionCustomization.module';
import contentCustomizingQueryDefinitions from '~/composables/api/queryDefinitions/contentCustomizing';
import type { IVeoRiskPotentialImpact, IVeoRiskProbabilityLevel, IVeoRiskValue } from '~/types/VeoTypes';

const { t, locale } = useI18n();
const route = useRoute();

const fetchDomainQueryParameters = computed(() => ({
  id: route.params.domain as string
}));

const { data: domain, isFetching: domainIsFetching } = useQuery(
  domainQueryDefinitions.queries.fetchDomain,
  fetchDomainQueryParameters
);

const data = computed(() => domain.value?.riskDefinitions?.[route.params.matrix as string]);

const probabilities = computed(() => data.value?.probability.levels || []);
const riskValues = computed(() => data.value?.riskValues || []);

const protectionGoals = computed(() =>
  (data.value?.categories || []).map((category) => ({
    text: category.translations[locale.value]?.name || Object.values(category.translations)[0].name,
    id: category.id
  }))
);

const getMatrixData = (protectionGoal: string) => {
  const category = data.value?.categories.find((category) => category.id === protectionGoal);

  return {
    impacts: category?.potentialImpacts ?? [],
    value: category?.valueMatrix ?? [],
    probabilities: data.value?.probability.levels || [],
    riskValues: data.value?.riskValues || []
  };
};

// Static data
const CONTRAST_THRESHOLD = 90;

const getMostContrastyColor = (backgroundColor: string) => {
  if (backgroundColor) {
    const hex = backgroundColor.substring(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return r * 0.299 + g * 0.587 + b * 0.114 > CONTRAST_THRESHOLD ? '#000000' : '#ffffff';
  } else {
    return '#000000';
  }
};

// Edit risk defintions
const hasEditor = ref(false);
const editorIsDirty = ref(false);
const riskDefinitionPart = ref();
const initialRiskDefinitionPart = ref();
const riskDefinitionId = computed(() => route.params.matrix);

function setUpEditing({
  type,
  typeTranslation,
  items,
  riskCategoryId
}: {
  type: string;
  typeTranslation: string;
  items: IVeoRiskValue[] | IVeoRiskProbabilityLevel[] | IVeoRiskPotentialImpact[];
  riskCategoryId?: string;
}) {
  hasEditor.value = true;
  watch(domain, assignFormData, { immediate: true });

  function assignFormData() {
    const _items = cloneDeep(items);
    riskDefinitionPart.value = {
      type,
      typeTranslation,
      items: _items,
      ...(riskCategoryId ? { riskCategoryId: riskCategoryId } : {})
    };

    initialRiskDefinitionPart.value = cloneDeep(riskDefinitionPart.value);
  }
}

// Check if users changed riskDefinitionPart
function evaluateDirtyState() {
  editorIsDirty.value = !isEqual(initialRiskDefinitionPart.value, riskDefinitionPart.value);
}
watch(riskDefinitionPart, evaluateDirtyState, { deep: true });

// Persist changed risk definitions
const { mutateAsync } = useMutation(contentCustomizingQueryDefinitions.mutations.updateRiskDefinitions);
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

function updateRiskDefinition({ riskDefinitionPart: newRiskDefinitionPart }) {
  try {
    if (!domain.value) throw new Error('No domain data available.');
    if (typeof riskDefinitionId.value != 'string') throw new Error('Risk catetegory ID is missing.');

    const currentRiskDefinition = getRiskDefinition(domain.value, riskDefinitionId.value);
    const riskDefinition = createNewRiskDefinition({
      currentRiskDefinition,
      newRiskDefinitionPart
    });

    mutateAsync({
      domainId: route.params.domain,
      riskDefinitionId: riskDefinitionId.value,
      riskDefinition
    });
    displaySuccessMessage(t('success'));
  } catch (error) {
    console.error(error);
    displayErrorMessage(t('error'));
  }
}
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-risks-matrix.json"></i18n>
<style scoped>
.mb-6 {
  margin-bottom: 24px;
}
.mx-1 {
  margin-inline: 8px;
}
.elevation-2 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.dashed-border {
  border: 2px dashed gray;
}
.d-flex {
  display: flex;
}
.text-center {
  text-align: center;
}
</style>
