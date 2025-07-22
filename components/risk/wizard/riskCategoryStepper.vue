<template>
  <v-stepper v-model="step" non-linear>
    <v-stepper-header>
      <v-stepper-item
        :ref="(el) => setStepperRef(el, 0)"
        :title="t('categoryName')"
        :value="1"
        editable
      ></v-stepper-item>
      <v-divider></v-divider>

      <v-stepper-item
        :ref="(el) => setStepperRef(el, 1)"
        :title="t('editRiskImpacts')"
        :value="2"
        editable
      ></v-stepper-item>

      <v-divider></v-divider>
      <v-stepper-item
        :ref="(el) => setStepperRef(el, 2)"
        :title="t('editRiskMatrix')"
        :value="3"
        editable
      ></v-stepper-item>
      <v-divider></v-divider>

      <v-stepper-item :ref="(el) => setStepperRef(el, 3)" :title="t('summary')" :value="4" editable></v-stepper-item>
    </v-stepper-header>
  </v-stepper>

  <v-window v-model="step" class="my-6" style="width: 100%">
    <!-- Translations Step -->
    <v-window-item :value="1">
      <v-card class="pa-8">
        <v-tabs v-model="activeLocaleTab" grow>
          <v-tab v-for="localeObj in LOCALES" :key="localeObj.code" :value="localeObj.code">
            {{ localeObj.name }}
          </v-tab>
        </v-tabs>
        <v-window v-model="activeLocaleTab">
          <v-window-item v-for="localeObj in LOCALES" :key="localeObj.code" :value="localeObj.code">
            <v-text-field
              v-model="localTranslations[localeObj.code].name"
              :label="`${t('inputLabel.name')} (${localeObj.name})`"
              class="mb-2"
              @input="onTranslationChange"
            />
            <v-textarea
              v-model="localTranslations[localeObj.code].description"
              :label="`${t('inputLabel.description')} (${localeObj.name})`"
              class="mb-2"
              @input="onTranslationChange"
            />
          </v-window-item>
        </v-window>
      </v-card>
    </v-window-item>
    <!-- Edit potential impacts -->
    <v-window-item :value="2">
      <RiskDefinitionEditor
        :data="potentialImpactsSingleCategory"
        @add-item="createPotentialImpact"
        @remove-item="deletePotentialImpact"
        @change-item="handleChange"
      >
        <template #infoBox>
          <BaseAlert
            :model-value="true"
            :buttons="[
              {
                text: t('createPotentialImpact'),
                onClick: () => createPotentialImpact()
              }
            ]"
            :title="t('createPotentialImpact')"
            :type="VeoAlertType.INFO"
            class="mx-14 my-8"
            flat
            no-close-button
          >
            {{ t('createPotentialImpactBody') }}
          </BaseAlert>
        </template>
      </RiskDefinitionEditor>
    </v-window-item>

    <!-- Edit risk matrix -->
    <v-window-item :value="3">
      <v-card class="pa-8">
        <template v-if="riskCategory.valueMatrix?.length">
          <RiskMatrix
            :value-matrix="riskCategory.valueMatrix"
            :potential-impacts="potentialImpactsSingleCategory"
            :risk-values="riskValues"
            :probability-levels="probabilityLevels"
            :is-edit-mode="true"
          />

          <v-container class="mt-2 d-flex justify-end">
            <v-btn color="primary" variant="outlined" @click="deleteValueMatrix(riskCategory.id)">{{
              t('deleteValueMatrix')
            }}</v-btn>
          </v-container>
        </template>

        <BaseAlert
          v-else
          :model-value="true"
          :buttons="[
            {
              text: t('createValueMatrix'),
              onClick: () => createInitialValueMatrix(riskCategory, potentialImpactsSingleCategory)
            }
          ]"
          :title="t('createValueMatrix')"
          :type="VeoAlertType.INFO"
          class="mx-14 my-2"
          flat
          no-close-button
        >
          {{ t('createValueMatrixBody') }}
        </BaseAlert>
      </v-card>
    </v-window-item>

    <!-- Summary -->
    <v-window-item :value="4">
      <v-card class="pa-8">
        <RiskMatrix
          :value-matrix="riskCategory.valueMatrix"
          :potential-impacts="potentialImpactsSingleCategory"
          :risk-values="riskValues"
          :probability-levels="probabilityLevels"
        />
      </v-card>
    </v-window-item>
  </v-window>
</template>
<script setup lang="ts">
import isEqual from 'lodash/isEqual';
import type {
  IVeoRiskCategory,
  IVeoRiskPotentialImpact,
  IVeoRiskProbabilityLevel,
  IVeoRiskValueLevel
} from '~/types/VeoTypes';
import { VeoAlertType } from '~/types/VeoTypes';
import { LOCALES } from '~/types/locales';

const props = defineProps<{
  riskValues: IVeoRiskValueLevel[];
  probabilityLevels: IVeoRiskProbabilityLevel[];
  riskCategory: IVeoRiskCategory;
  potentialImpactsSingleCategory: IVeoRiskPotentialImpact[];
  createPotentialImpact: () => void;
  deletePotentialImpact: (index: number) => void;
  createInitialValueMatrix: (
    riskCategory: IVeoRiskCategory,
    potentialImpactsSingleCategory: IVeoRiskPotentialImpact[]
  ) => void;
  deleteValueMatrix: (riskCategoryId: string) => void;
  validateNames: (input: string, items: IVeoRiskPotentialImpact[]) => void;
  translations: Record<string, { name: string; abbreviation: string; description: string }>;
}>();

const emit = defineEmits<{
  'update:translations': [translations: Record<string, { name: string; abbreviation: string; description: string }>];
}>();

function handleChange(_index: number, value: string) {
  props.validateNames(value, props.potentialImpactsSingleCategory);
}

const { t } = useI18n();

const step = defineModel<number>('step', { default: 1 });
const { setStepperRef } = useSideScroll(step); // Make stepper side-scrollable

const activeLocaleTab = ref(LOCALES[0].code);

const initializeLocalTranslations = () => {
  const result: Record<string, { name: string; abbreviation: string; description: string }> = {};
  LOCALES.forEach((localeObj) => {
    result[localeObj.code] = props.translations?.[localeObj.code] || {
      name: '',
      abbreviation: '',
      description: ''
    };
  });
  return result;
};

const localTranslations = ref(initializeLocalTranslations());

const onTranslationChange = () => {
  emit('update:translations', { ...localTranslations.value });
};

watch(
  () => props.translations,
  (newTranslations) => {
    if (!newTranslations) return;

    const result: Record<string, { name: string; abbreviation: string; description: string }> = {};
    LOCALES.forEach((localeObj) => {
      result[localeObj.code] = newTranslations[localeObj.code] || {
        name: '',
        abbreviation: '',
        description: ''
      };
    });

    // Only update if there's a meaningful difference
    if (!isEqual(localTranslations.value, result)) {
      localTranslations.value = result;
    }
  },
  { immediate: true, deep: true }
);
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
