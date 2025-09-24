<!--
   - verinice.veo web
   - Copyright (C) 2025 jae
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
  <BasePage data-component-name="unit-selection-page">
    <BaseContainer>
      <template v-if="riskDefinition">
        <v-row data-component-name="risk-matrix-wrapper">
          <v-col cols="12">
            <h1>{{ riskDefinition?.id }}</h1>
          </v-col>
        </v-row>

        <!-- Cross category values -->
        <v-row>
          <v-col cols="12">
            <v-card class="pa-2">
              <div class="d-flex justify-space-between">
                <v-card-title>{{ t('crossCategoryValues') }}</v-card-title>
                <v-card-actions>
                  <v-btn
                    :icon="mdiPencil"
                    variant="plain"
                    size="small"
                    :to="`${route.path}/edit`"
                    data-veo-test="risk-cross-category-edit"
                  />
                </v-card-actions>
              </div>
              <div class="d-flex align-center">
                <RiskProperty :title="t('riskValues')" :items="riskDefinition.riskValues" />
                <RiskProperty :title="t('probability')" :items="riskDefinition.probability.levels" />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Risk categories -->
        <v-row>
          <v-col cols="12">
            <div class="d-flex justify-space-between align-center">
              <h2>{{ t('criterion') }}</h2>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                :prepend-icon="mdiPlus"
                data-veo-test="add-risk-category-button"
                @click="addRiskCategory"
              >
                {{ t('manageCriteria') }}
              </v-btn>
            </div>
          </v-col>
          <RiskCategory
            v-for="riskCategory in riskDefinition.categories"
            :key="riskCategory.id"
            :value-matrix="riskCategory.valueMatrix ?? []"
            :potential-impacts="riskCategory.potentialImpacts ?? []"
            :risk-values="riskDefinition.riskValues ?? []"
            :probability-levels="riskDefinition.probability.levels ?? []"
            :risk-category="riskCategory"
            :delete-risk-category="() => requestDeleteRiskCategory(riskCategory.id)"
          />
        </v-row>
        <v-dialog v-model="closeConfirmationDialogVisible" width="450px">
          <v-card>
            <v-card-title class="bg-accent small-caps">
              {{ t('deleteDialog') }}
            </v-card-title>
            <v-card-text>
              {{ t('deleteDialogBody') }}
              <v-card-actions class="px-0 pb-0">
                <v-btn variant="text" @click="cancelDeleteRiskCategory">
                  {{ t('global.button.cancel') }}
                </v-btn>
                <v-spacer />
                <v-btn
                  ref="confirmButton"
                  color="primary"
                  variant="text"
                  @click="confirmDeleteRiskCategory"
                  @keydown.enter="confirmDeleteRiskCategory"
                >
                  {{ t('global.button.yes') }}
                </v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-dialog>
      </template>
      <v-skeleton-loader v-else type="heading"></v-skeleton-loader>
    </BaseContainer>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-risks-definition';
</script>

<script setup lang="ts">
import { mdiPencil, mdiPlus } from '@mdi/js';
import {
  createRiskCategory,
  deleteRiskCategory as deleteRiskCategoryHelper,
  getUpdatedRiskDefinition,
  cleanUpValueMatrix
} from '~/components/risk/wizard/helpers';
import { useRiskDefinitionUpdate } from '~/composables/useRiskDefinitions';
const { t } = useVeoI18n();
const route = useRoute();
const closeConfirmationDialogVisible = ref(false);
const categoryToDelete = ref<string | null>(null);

// Handle risk definition
const { data, reload } = useRiskDefinition();
const riskDefinition = ref();

watch(data, (newData) => {
  if (!newData) return;

  riskDefinition.value = {
    ...data.value,
    categories: newData.categories?.map((category) => ({
      ...category,
      valueMatrix: cleanUpValueMatrix(category.valueMatrix, newData.riskValues)
    }))
  };
});

const addRiskCategory = () => {
  const newRiskCategory = createRiskCategory();
  navigateTo(`${route.path}/edit?id=${newRiskCategory.id}`);
};

const { saveRiskDefinition } = useRiskDefinitionUpdate();

const requestDeleteRiskCategory = (categoryId: string) => {
  categoryToDelete.value = categoryId;
  closeConfirmationDialogVisible.value = true;
};

const confirmDeleteRiskCategory = async () => {
  if (!riskDefinition.value || !categoryToDelete.value) {
    closeConfirmationDialogVisible.value = false;
    categoryToDelete.value = null;
    return;
  }
  closeConfirmationDialogVisible.value = false;
  // Remove the category from the list
  const newCategories = deleteRiskCategoryHelper(riskDefinition.value.categories, categoryToDelete.value);
  // Create the updated risk definition
  const updatedRiskDefinition = getUpdatedRiskDefinition(
    riskDefinition.value,
    newCategories,
    riskDefinition.value.probability.levels,
    riskDefinition.value.riskValues
  );
  // Persist the change
  await saveRiskDefinition(updatedRiskDefinition);
  categoryToDelete.value = null;
  reload();
};

const cancelDeleteRiskCategory = () => {
  closeConfirmationDialogVisible.value = false;
  categoryToDelete.value = null;
};
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks-matrix.json"></i18n>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
