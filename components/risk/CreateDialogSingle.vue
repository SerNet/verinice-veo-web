<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <BaseDialog
    data-test-selector="create-dialog-single"
    :model-value="modelValue"
    :close-disabled="savingRisk"
    :confirm-close="!!Object.keys(dirtyFields).length && Object.values(dirtyFields).some(Boolean)"
    :title="
      upperFirst(
        !!risk ? t('editRisk', [risk.designator, risk.scenario?.displayName]).toString() : t('createRisk').toString()
      )
    "
    x-large
    fixed-footer
    v-bind="$attrs"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <BaseAlert
        :model-value="!!Object.keys(dirtyFields).length"
        :type="VeoAlertType.INFO"
        :title="t('computedValues')"
        :text="t('computedValuesCTA')"
        flat
        no-close-button
      />
      <v-form v-if="data" v-model="formIsValid">
        <h2 class="text-h2 mb-1">
          {{ upperFirst(t('common').toString()) }}
        </h2>
        <BaseCard border padding>
          <v-row>
            <v-col xs="12" md="6">
              <!-- @vue-ignore TODO #3066 not assignable -->
              <UtilObjectSelect
                data-test-selector="risk-scenario"
                :model-value="data.scenario"
                object-type="scenario"
                sub-type="route.params.subType"
                :rules="[requiredRule]"
                :domain-id="domainId"
                :disabled="formDisabled"
                hide-details
                @update:model-value="onScenarioChanged"
              />
            </v-col>
            <v-col xs="12" md="6">
              <!-- @vue-ignore TODO #3066 $route does not exist -->
              <UtilObjectSelect
                data-test-selector="risk-owner"
                :model-value="data.riskOwner"
                object-type="person"
                :label="upperFirst(t('riskOwner').toString())"
                :domain-id="domainId"
                :disabled="formDisabled"
                hide-details
                @update:model-value="onRiskOwnerChanged"
              />
            </v-col>
          </v-row>
        </BaseCard>
        <RiskCreateDialogRiskDefinitions
          v-model:dirty-fields="dirtyFields"
          :model-value="data"
          :domain="domain"
          :disabled="formDisabled"
          :mitigations="mitigations"
          @update:new-mitigating-action="newMitigatingAction = $event"
          @mitigations-modified="onMitigationsModified"
          @update:model-value="onRiskDefinitionsChanged"
        />
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn
        data-veo-test="dialog-risk-close"
        variant="text"
        color="primary"
        :disabled="savingRisk"
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.close') }}
      </v-btn>

      <v-spacer />

      <v-btn
        data-veo-test="dialog-risk-save"
        variant="text"
        color="primary"
        :loading="savingRisk"
        :disabled="formIsValid === false || !formModified || !canManageUnitContent"
        @click="saveRisk"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { cloneDeep, isEqual, merge, upperFirst } from 'lodash';

import { useQueryClient } from '@tanstack/vue-query';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCreateLink, useLinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import elementQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import type { IVeoDomainRiskDefinition, IVeoEntity, IVeoLink, IVeoRisk } from '~/types/VeoTypes';
import { VeoAlertType } from '~/types/VeoTypes';

export interface IDirtyFields {
  [field: string]: boolean;
}

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    scenarioId: {
      type: String,
      default: undefined
    },
    domainId: {
      type: String,
      required: true
    },
    objectId: {
      type: String,
      required: true
    },
    objectType: {
      type: String,
      required: true
    }
  },
  emits: ['update:model-value'],
  setup(props) {
    const config = useRuntimeConfig();
    const route = useRoute();
    const { t, locale } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { link } = useLinkObject();
    const { createLink } = useCreateLink();
    const { mutateAsync: createObject } = useMutation(elementQueryDefinitions.mutations.createObject);
    const { requiredRule } = useRules();
    const queryClient = useQueryClient();

    const { ability, subject } = useVeoPermissions();
    const canManageUnitContent = computed(() =>
      ability.value.can('manage', subject('units', { id: route.params.unit }))
    );

    const formDisabled = computed(() => !canManageUnitContent.value);

    // Domain stuff, used for risk definitions
    const data = ref<IVeoRisk | undefined>(undefined);
    const originalData = ref<IVeoRisk | undefined>(undefined);

    const fetchDomainQueryParameters = computed(() => ({ id: props.domainId }));
    const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters);

    const formIsValid = ref(true);
    const formModified = ref(false);
    const validate = () => {
      formModified.value = !isEqual(data.value, originalData.value) || mitigationsModified.value;
    };

    // dirty/pristine stuff
    const dirtyFields = ref<IDirtyFields>({});

    const onScenarioChanged = (newValue: IVeoLink) => {
      if (data.value) {
        data.value.scenario = newValue;
        dirtyFields.value.scenario = true;
        validate();
      }
    };

    const onRiskOwnerChanged = (newValue: IVeoLink) => {
      if (data.value) {
        // For some reason nuxt won't pick up the changes otherwise (probably fixed with nuxt 3)
        data.value = { ...data.value, ...{ riskOwner: newValue } };
        dirtyFields.value.riskOwner = true;
        validate();
      }
    };

    const onRiskDefinitionsChanged = (newValue: IVeoRisk) => {
      data.value = newValue;
      validate();
    };

    const fetchRiskQueryParameters = computed(() => ({
      scenarioId: props.scenarioId as string,
      objectId: props.objectId,
      endpoint: route.params.objectType as string
    }));
    const fetchRiskQueryEnabled = computed(() => !!props.scenarioId);

    const { data: _risk } = useQuery(elementQueryDefinitions.queries.fetchRisk, fetchRiskQueryParameters, {
      enabled: fetchRiskQueryEnabled,
      onSuccess: () => {
        init();
      }
    });

    const risk = computed(() => (props.scenarioId ? _risk.value : undefined));

    const init = () => {
      if (risk.value && domain.value) {
        data.value = makeRiskObject(risk.value, props.domainId, domain.value?.riskDefinitions || {});
        originalData.value = cloneDeep(data.value);
        formIsValid.value = true;

        nextTick(() => {
          dirtyFields.value = {};
        });
      }
    };

    watch(() => domain.value, init, { deep: true, immediate: true });
    watch(() => risk.value, init, { deep: true, immediate: true });
    watch(() => props.modelValue, init, { immediate: true });

    const savingRisk = ref(false);
    const { mutateAsync: createRisk } = useMutation(elementQueryDefinitions.mutations.createRisk);
    const { mutateAsync: updateRisk } = useMutation(elementQueryDefinitions.mutations.updateRisk);
    const saveRisk = async () => {
      if (!canManageUnitContent.value || !data.value) return;

      savingRisk.value = true;

      try {
        if (mitigationsModified.value) {
          const mitigationId = data.value.mitigation?.id;

          // If there's no existing mitigation ID and there are mitigations available, create a new one
          if (!mitigationId && mitigations.value.length) {
            const { resourceId } = await createObject({
              endpoint: 'controls',
              domain: props.domainId,
              object: newMitigatingAction.value
            });
            data.value.mitigation = createLink('controls', resourceId); // Link the new mitigation to the data
          }

          // If a mitigation ID exists, fetch its data and link it to the current mitigations
          else if (mitigationId) {
            const mitigationData = await useQuerySync(
              elementQueryDefinitions.queries.fetch,
              {
                domain: props.domainId,
                endpoint: 'controls',
                id: mitigationId
              },
              queryClient
            );
            await link(mitigationData, mitigations.value, true);
          }
        }

        const riskParams = {
          endpoint: route.params.objectType,
          risk: data.value,
          ...(props.scenarioId ? { id: props.objectId, scenarioId: props.scenarioId } : { objectId: props.objectId })
        };
        await (props.scenarioId ? updateRisk(riskParams) : createRisk(riskParams));

        displaySuccessMessage(upperFirst(t(props.scenarioId ? 'riskUpdated' : 'riskCreated').toString()));
        dirtyFields.value = {};
        formModified.value = false;
        mitigationsModified.value = false;
      } catch (error: any) {
        displayErrorMessage(upperFirst(t('riskNotSaved').toString()), error.message);
      } finally {
        savingRisk.value = false;
      }
    };

    // Mitigating action stuff
    const mitigations = ref<IVeoEntity[]>([]);

    const mitigationsModified = ref(false);
    const onMitigationsModified = (value: boolean, newMitigation?: IVeoEntity[]) => {
      mitigationsModified.value = value;
      dirtyFields.value.mitigation = value;
      if (value) mitigations.value = newMitigation;
      validate();
    };

    const newMitigatingAction = computed(() => ({
      type: 'control',
      name: t('mitigatingAction', [data.value?.designator]).toString(),
      owner: {
        targetUri: `${config.public.apiUrl}/units/${route.params.unit}`
      },
      // TODO #3866: Remove this once we have a proper ISO group control
      subType:
        domain.value?.translations?.[locale.value]?.abbreviation === 'ISO' ?
          'CTL_ISOGroup'
        : domain.value?.controlImplementationConfiguration?.mitigationControlSubType,
      status: 'NEW',
      parts: mitigations.value.map((m) => createLink('controls', m.id))
    }));

    return {
      canManageUnitContent,
      data,
      dirtyFields,
      domain,
      formDisabled,
      formIsValid,
      formModified,
      mitigations,
      mitigationsModified,
      newMitigatingAction,
      onMitigationsModified,
      onRiskDefinitionsChanged,
      onRiskOwnerChanged,
      onScenarioChanged,
      requiredRule,
      risk,
      saveRisk,
      savingRisk,

      upperFirst,
      t,
      globalT,
      VeoAlertType
    };
  }
});

const makeRiskObject = (
  initialData: IVeoRisk | undefined,
  domainId: string,
  riskDefinitions: { [key: string]: IVeoDomainRiskDefinition }
): IVeoRisk => {
  const _initialData = cloneDeep(initialData);
  const object: any = {
    scenario: undefined,
    mitigation: undefined,
    riskOwner: undefined,
    process: undefined,
    domains: {
      [domainId]: {
        riskDefinitions: {}
      }
    }
  };

  const mergedObject = _initialData ? merge(_initialData, object) : object;

  for (const riskDefinition in riskDefinitions) {
    if (!mergedObject.domains[domainId].riskDefinitions[riskDefinition]) {
      mergedObject.domains[domainId].riskDefinitions[riskDefinition] = {
        impactValues: [],
        riskValues: []
      };
    }
    merge(mergedObject.domains[domainId].riskDefinitions[riskDefinition], {
      probability: {
        effectiveProbability: undefined,
        potentialProbability: undefined,
        specificProbability: undefined,
        specificProbabilityExplanation: undefined
      }
    });

    for (const category of riskDefinitions[riskDefinition]!.categories.map((category) => category.id)) {
      const impactValueObject = {
        category,
        effectiveImpact: undefined,
        specificImpact: undefined,
        specificImpactExplanation: undefined,
        potentialImpact: undefined
      };
      if (
        !mergedObject.domains[domainId].riskDefinitions[riskDefinition].impactValues.find(
          (impactValue: any) => impactValue.category === category
        )
      ) {
        mergedObject.domains[domainId].riskDefinitions[riskDefinition].impactValues.push(impactValueObject);
      } else {
        merge(
          mergedObject.domains[domainId].riskDefinitions[riskDefinition].impactValues.find(
            (impactValue: any) => impactValue.category === category
          ),
          impactValueObject
        );
      }

      const riskValueObject = {
        category,
        userDefinedResidualRisk: undefined,
        residualRisk: undefined,
        residualRiskExplanation: undefined,
        riskTreatments: [],
        riskTreatmentExplanation: undefined
      };
      if (
        !mergedObject.domains[domainId].riskDefinitions[riskDefinition].riskValues.find(
          (riskValue: any) => riskValue.category === category
        )
      ) {
        mergedObject.domains[domainId].riskDefinitions[riskDefinition].riskValues.push(riskValueObject);
      } else {
        merge(
          mergedObject.domains[domainId].riskDefinitions[riskDefinition].riskValues.find(
            (impactValue: any) => impactValue.category === category
          ),
          riskValueObject
        );
      }
    }
  }
  return mergedObject;
};
</script>

<i18n src="~/locales/base/components/risk-create-dialog-single.json"></i18n>

<style lang="scss" scoped>
:deep(.text-h2) {
  margin-top: 16px !important;
}

:deep(.veo-section-border) {
  border: 1px solid #d7d7d7;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.v-divider) {
  display: none;
}
</style>
