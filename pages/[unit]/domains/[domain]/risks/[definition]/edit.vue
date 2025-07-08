<!--
verinice.veo web
Copyright (C) 2025 jae

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BasePage
    id="risk-definition-wizard"
    class="pt-6"
    data-component-name="risk-definition-wizard"
    data-veo-test="risk-definition-wizard"
    :has-base-container="true"
    sticky-footer
  >
    <BaseContainer>
      <RiskWizardCrossCategoryStepper
        v-if="!riskCategoryId && riskCategories?.length"
        v-model:step="step"
        :risk-categories="riskCategories"
        :probability-levels="probabilityLevels"
        :risk-values="riskValues"
        :locale="locale"
        :potential-impacts="potentialImpactsAll"
        :create-risk-value="createRiskValue"
        :update-risk-value="updateRiskValues"
        :delete-risk-value="deleteRiskValue"
        :create-probability-level="addProbabilityLevel"
        :delete-probability-level="deleteProbabilityLevel"
        :validate-names="validateNames"
      />

      <RiskWizardRiskCategoryStepper
        v-if="riskCategoryId && riskCategories?.length"
        v-model:step="step"
        :risk-category="riskCategory"
        :potential-impacts-single-category="potentialImpactsSingleCategory"
        :probability-levels="probabilityLevels"
        :risk-values="riskValues"
        :create-potential-impact="createSingleModePotentialImpact"
        :delete-potential-impact="deleteSingleModePotentialImpact"
        :create-initial-value-matrix="createInitialValueMatrix"
        :delete-value-matrix="deleteValueMatrix"
        :validate-names="validateNames"
        :translations="riskCategoryTranslations"
        @update:translations="updateRiskCategoryTranslations"
      />
    </BaseContainer>

    <!-- Actions --->
    <template #footer>
      <BaseContainer class="pt-0">
        <div class="d-flex justify-space-between ga-2">
          <div class="d-flex ga-2">
            <v-btn v-if="step > 1" size="large" class="my-6" variant="flat" color="secondary" @click="goBack">
              {{ globalT('global.button.back') }}
            </v-btn>

            <v-btn :to="riskDefinitionRoute" size="large" class="my-6" color="secondary" variant="flat">
              {{ t('goToRiskDefintion') }}
            </v-btn>

            <template v-if="!isInitializingFeatureFlags">
              <RiskEvaluation
                v-if="featureFlags?.riskDefinitionEvaluation"
                :risk-definition="riskDefinition"
                :risk-categories="riskCategories"
                :probability-levels="probabilityLevels"
                :risk-values="riskValues"
                :save="save"
                :can-save="canSave"
              />
              <v-btn v-else size="large" class="my-6" color="primary" variant="flat" :disabled="!canSave" @click="save">
                {{ t('saveRiskDefinition') }}
              </v-btn>
            </template>
          </div>

          <div class="d-flex ga-2">
            <v-btn
              v-if="riskCategoryId ? step < 3 : step < riskCategories?.length + 3"
              data-veo-test="next-btn"
              size="large"
              class="my-6"
              color="secondary"
              variant="flat"
              :disabled="
                (riskCategories?.[step - 3]?.valueMatrix &&
                  hasUnsetRiskValues(riskCategories?.[step - 3]?.valueMatrix)) ||
                !canGoNext
              "
              @click="goForward"
            >
              {{ globalT('global.button.next') }}
            </v-btn>
          </div>
        </div>
      </BaseContainer>
    </template>
  </BasePage>
</template>
<script setup lang="ts">
import { cloneDeep, isEqual } from 'lodash';
import {
  createNewMatrixRow,
  createRiskCategory,
  getUpdatedRiskDefinition,
  hasUnsetRiskValues,
  Impact,
  ProbabilityLevel,
  removeMatrixRow,
  RiskValue,
  UnsetItem,
  updateRiskCategory,
  updateRiskMatrixValues
} from '~/components/risk/wizard/helpers';
import type {
  IVeoRiskCategory,
  IVeoRiskDefinitionItemTranslations,
  IVeoRiskPotentialImpact,
  IVeoRiskProbabilityLevel,
  IVeoRiskValueLevel
} from '~/types/VeoTypes';

const { t: globalT } = useI18n({ useScope: 'global' });
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const { featureFlags, isInitializingFeatureFlags } = useFeatureFlag();

const riskCategoryId = computed(() => (route?.query.id as string) ?? '');
const { data: riskDefinition } = useRiskDefinition();

const step = ref(1);
let hasInitialData = false;

function goForward() {
  step.value++;
}

function goBack() {
  step.value--;
}

// Route of the current category
const riskDefinitionRoute = computed(() => route.path.replace(/\/edit$/, ''));

// State
const probabilityLevels = ref([]);
const riskValues = ref([]);
const riskCategories = ref<IVeoRiskCategory[]>([]);
const riskCategoryTranslations = ref<IVeoRiskDefinitionItemTranslations>({});

const findCategoryById = (id: string) => riskCategories.value.find((cat) => cat.id === id);

// Initialize state from risk definition
function initializeFromRiskDefinition() {
  if (!riskDefinition.value) return;

  riskValues.value = cloneDeep(riskDefinition.value.riskValues) ?? [];
  probabilityLevels.value = cloneDeep(riskDefinition.value.probability?.levels) ?? [];
  riskCategories.value = cloneDeep(riskDefinition.value.categories) ?? [];

  // Set initial data for dirty checking
  if (!hasInitialData) assignInitialData();

  if (riskCategoryId.value && !findCategoryById(riskCategoryId.value)) {
    const newCategory = createRiskCategory(riskCategoryId.value);
    riskCategories.value.push(newCategory);
  }

  // Update translations for current category
  updateCategoryTranslations();
}

function updateCategoryTranslations() {
  const currentCategory = findCategoryById(riskCategoryId.value);
  riskCategoryTranslations.value = cloneDeep(currentCategory?.translations) ?? {};
}

watch(riskDefinition, initializeFromRiskDefinition, { immediate: true, deep: true });

// Watch for changes in riskCategoryId to update translations when switching categories
watch(riskCategoryId, (newCategoryId) => {
  if (newCategoryId && riskCategories.value.length) {
    updateCategoryTranslations();
    isMissingTranslations.value = false;
  }
});

const potentialImpactsAll = computed<IVeoRiskPotentialImpact[][]>(
  () => riskDefinition.value?.categories?.map((category) => category.potentialImpacts) ?? []
);

// Validations
const isMissingTranslations = ref(false);
const hasUnsetMatrixValues = computed(() =>
  riskCategories.value.some((category) => category?.valueMatrix && hasUnsetRiskValues(category.valueMatrix))
);

const hasEmptyTranslations = computed(() =>
  riskCategories.value.some((category) => Object.values(category?.translations ?? {}).some((t) => t.name === ''))
);

const hasUnsetItems = computed(() => hasUnsetMatrixValues.value || hasEmptyTranslations.value);

const canSave = computed(() => !hasUnsetItems.value && !isMissingTranslations.value && isDirty.value);
const canGoNext = computed(() => !isMissingTranslations.value);

// MANIPULATE STATE CROSS CATEGORY MODE

// Risk values
function createRiskValue() {
  const newRiskValue = new RiskValue(riskValues.value);
  riskValues.value = [...riskValues.value, newRiskValue];
}

// When updating risk values, update risk matrices as well, because
// risk matrices contain instances/manifestations of risk values
function updateRiskValues(riskValueIndex: number) {
  const updatedRiskValue = riskValues.value[riskValueIndex];

  riskCategories.value = riskCategories.value.map((category) =>
    updateRiskMatrixValues(category, updatedRiskValue, updatedRiskValue)
  );
}

function deleteRiskValue(riskValueIndex: number) {
  const oldRiskValue = riskValues.value[riskValueIndex];
  riskValues.value = riskValues.value.filter((_rv, index) => index !== riskValueIndex);

  // loop over matrices, find instances where oldValue was used, set them to `noValue`
  const unsetItem = new UnsetItem();
  riskCategories.value = riskCategories.value.map((category) =>
    updateRiskMatrixValues(category, oldRiskValue, unsetItem)
  );
}

// Probability levels
function addProbabilityLevel() {
  const newProbabilityLevel = new ProbabilityLevel(probabilityLevels.value);
  probabilityLevels.value = [...probabilityLevels.value, newProbabilityLevel];

  // Add a column to each matrix
  //TODO: put in fn and use updateRiskCategory fn
  riskCategories.value = riskCategories.value.map((category) => {
    const valueMatrix = category.valueMatrix?.map((row: IVeoRiskValueLevel[]) => [...row, new UnsetItem()]);
    return { ...category, valueMatrix };
  });
}

function deleteProbabilityLevel(index: number) {
  // Remove probability level
  probabilityLevels.value = probabilityLevels.value.filter((level) => level.ordinalValue !== index);

  // Remove column from risk matrices
  //TODO: put in fn and use updateRiskCategory fn
  riskCategories.value = riskCategories.value.map((category) => {
    const valueMatrix = category.valueMatrix?.map((row: IVeoRiskValueLevel[]) =>
      row.filter((_riskValue, i) => i !== index)
    );
    return { ...category, valueMatrix };
  });
}

// PUT
const { saveRiskDefinition } = useRiskDefinitionUpdate();
async function save() {
  const newRiskDefinition = getUpdatedRiskDefinition(
    riskDefinition.value,
    riskCategories.value,
    probabilityLevels.value,
    riskValues.value
  );

  await saveRiskDefinition(newRiskDefinition);
  router.push(riskDefinitionRoute.value);
}

// State: Single category mode (riskCategoryStepper)
const riskCategory = computed<IVeoRiskCategory>(() => {
  if (!riskCategoryId || !riskDefinition) return {} as IVeoRiskCategory;
  const category = riskCategories.value?.find((cat) => cat.id === riskCategoryId.value);
  return category ?? ({} as IVeoRiskCategory);
});

const potentialImpactsSingleCategory = computed<IVeoRiskPotentialImpact[] | UnsetItem[]>(() =>
  riskCategory.value?.potentialImpacts?.length ? riskCategory.value.potentialImpacts : []
);

// MANIPULATE STATE SINGLE CATEGORY MODE
function createSingleModePotentialImpact() {
  const newImpact =
    potentialImpactsSingleCategory.value.length ? new Impact(potentialImpactsSingleCategory.value) : new UnsetItem();
  const rowLength = probabilityLevels.value.length ?? 0;
  const newValueMatrix =
    riskCategory.value?.valueMatrix?.length ?
      createNewMatrixRow(cloneDeep(riskCategory.value.valueMatrix), new UnsetItem(), rowLength)
    : undefined;

  riskCategories.value = updateRiskCategory(riskCategories.value, {
    ...riskCategory.value,
    potentialImpacts: [...potentialImpactsSingleCategory.value, newImpact],
    valueMatrix: newValueMatrix
  });
}

async function updateRiskCategoryTranslations(newTranslations: IVeoRiskDefinitionItemTranslations) {
  const updatedCategory = {
    ...riskCategory.value,
    translations: { ...newTranslations }
  };

  riskCategories.value = riskCategories.value.map((category) =>
    category.id === riskCategoryId.value ? updatedCategory : category
  );
  riskCategoryTranslations.value = { ...newTranslations };
  isMissingTranslations.value = false;
}

function deleteSingleModePotentialImpact(index: number) {
  const newPotentialImpacts = potentialImpactsSingleCategory.value?.filter((_, i) => i !== index);

  riskCategories.value = updateRiskCategory(riskCategories.value, {
    ...riskCategory.value,
    potentialImpacts: newPotentialImpacts,
    valueMatrix: removeMatrixRow(cloneDeep(riskCategory.value.valueMatrix), index)
  });
}

function createInitialValueMatrix(riskCategory: IVeoRiskCategory, potentialImpacts: IVeoRiskPotentialImpact[]) {
  if (!riskCategories.value || !riskCategory.potentialImpacts.length) return;

  riskCategories.value = riskCategories.value.map((category) => {
    if (category.id === riskCategory.id) {
      let newValueMatrix = [];
      const rowLength = probabilityLevels.value.length ?? 0;

      // Add a row for each potential impact
      potentialImpacts.forEach((_impact) => {
        newValueMatrix = createNewMatrixRow(cloneDeep(newValueMatrix), new UnsetItem(), rowLength);
      });

      return {
        ...category,
        valueMatrix: newValueMatrix
      };
    }
    return category;
  });
}

function deleteValueMatrix(riskCategoryId: string) {
  riskCategories.value = riskCategories.value.map((category) => {
    if (category.id === riskCategoryId) {
      return { ...category, valueMatrix: undefined };
    }
    return category;
  });
}

function hasMissingTranslations(
  items: IVeoRiskValueLevel[] | IVeoRiskPotentialImpact[] | IVeoRiskProbabilityLevel[]
): boolean {
  return items.some((item) =>
    Object.values(item?.translations ?? {}).some(
      (translationArray) => Array.isArray(translationArray) && translationArray.some((t) => t.name === '')
    )
  );
}

function validateNames(
  name: string,
  items: IVeoRiskValueLevel[] | IVeoRiskPotentialImpact[] | IVeoRiskProbabilityLevel[]
) {
  isMissingTranslations.value = name === '' || hasMissingTranslations(items);
}

// Dirty state
type InitialData = {
  probabilityLevels: IVeoRiskProbabilityLevel[];
  riskValues: IVeoRiskValueLevel[];
  riskCategories: IVeoRiskCategory[];
};

const isDirty = ref(false);
const initialData: InitialData = {
  probabilityLevels: [],
  riskValues: [],
  riskCategories: []
};

function assignInitialData() {
  hasInitialData = true;
  initialData.probabilityLevels = cloneDeep(probabilityLevels.value);
  initialData.riskValues = cloneDeep(riskValues.value);
  initialData.riskCategories = cloneDeep(riskCategories.value);
}

function evaluateDirtyWizard() {
  if (!hasInitialData) return false;
  return (
    !isEqual(probabilityLevels.value, initialData.probabilityLevels) ||
    !isEqual(riskValues.value, initialData.riskValues) ||
    !isEqual(riskCategories.value, initialData.riskCategories)
  );
}

watch(
  [probabilityLevels, riskValues, riskCategories],
  () => {
    if (!riskDefinition.value) return false;
    isDirty.value = evaluateDirtyWizard();
  },
  { immediate: true, deep: true }
);
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
