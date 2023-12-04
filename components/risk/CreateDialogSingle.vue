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
    :confirm-close="!!Object.keys(dirtyFields).length"
    :title="upperFirst(!!risk ? t('editRisk', [risk.designator]).toString() : t('createRisk').toString())"
    x-large
    fixed-footer
    v-bind="$attrs"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <BaseAlert
        :model-value="true"
        :type="VeoAlertType.INFO"
        :title="t('computedValues')"
        :text="t('computedValuesCTA')"
        flat
        no-close-button
      />
      <v-form
        v-if="data"
        v-model="formIsValid"
      >
        <h2 class="text-h2 mb-1">
          {{ upperFirst(t('common').toString()) }}
        </h2>
        <BaseCard>
          <v-card-text class="pa-3 px-4">
            <v-row>
              <v-col
                xs="12"
                md="6"
              >
                <UtilObjectSelect
                  data-test-selector="risk-scenario"
                  :model-value="data.scenario"
                  object-type="scenario"
                  sub-type="route.params.subType"
                  required
                  :rules="[requiredRule]"
                  :domain-id="domainId"
                  :disabled="formDisabled"
                  value-as-link
                  hide-details
                  @update:model-value="onScenarioChanged"
                />
              </v-col>
              <v-col
                xs="12"
                md="6"
              >
                <UtilObjectSelect
                  data-test-selector="risk-owner"
                  :model-value="data.riskOwner"
                  object-type="person"
                  sub-type="route.params.subType"
                  required
                  :label="upperFirst(t('riskOwner').toString())"
                  :domain-id="domainId"
                  :disabled="formDisabled"
                  value-as-link
                  hide-details
                  @update:model-value="onRiskOwnerChanged"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </BaseCard>
        <RiskCreateDialogRiskDefinitions
          v-model:dirty-fields="dirtyFields"
          :model-value="data"
          :domain="domain"
          :disabled="formDisabled"
          :mitigations="mitigations"
          @update:mitigations="onMitigationsChanged"
          @update:new-mitigating-action="newMitigatingAction = $event"
          @mitigations-modified="onMitigationsModified"
          @update:model-value="onRiskDefinitionsChanged"
        />
      </v-form>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :loading="savingRisk"
        :disabled="formIsValid === false || !formModified || ability.cannot('manage', 'objects')"
        @click="saveRisk"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
      <v-btn
        variant="text"
        color="primary"
        :disabled="savingRisk"
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.close') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { cloneDeep, isEqual, merge, upperFirst } from 'lodash';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { getEntityDetailsFromLink } from '~/lib/utils';
import { IVeoLink, IVeoRisk, IVeoDomainRiskDefinition, VeoAlertType, IVeoEntity } from '~/types/VeoTypes';
import { useCreateLink, useLinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQueryClient } from '@tanstack/vue-query';

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
    const { t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { link } = useLinkObject();
    const { createLink } = useCreateLink();
    const { ability } = useVeoPermissions();
    const { mutateAsync: createObject } = useMutation(objectQueryDefinitions.mutations.createObject);
    const { requiredRule } = useRules();
    const queryClient = useQueryClient();

    const formDisabled = computed(() => ability.value.cannot('manage', 'objects'));

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

    const fetchRiskQueryParameters = computed(() => ({ scenarioId: props.scenarioId as string, objectId: props.objectId, endpoint: route.params.objectType as string }));
    const fetchRiskQueryEnabled = computed(() => !!props.scenarioId);

    const { data: _risk } = useQuery(objectQueryDefinitions.queries.fetchRisk, fetchRiskQueryParameters, { enabled: fetchRiskQueryEnabled, onSuccess: () => {
      init();
    } });

    const risk = computed(() => props.scenarioId ? _risk.value : undefined);

    const init = () => {
      if(risk.value && domain.value) {
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
    const { mutateAsync: createRisk } = useMutation(objectQueryDefinitions.mutations.createRisk);
    const { mutateAsync: updateRisk } = useMutation(objectQueryDefinitions.mutations.updateRisk);
    const saveRisk = async () => {
      if(ability.value.cannot('manage', 'objects')) {
        return;
      }
      if (data.value) {
        savingRisk.value = true;

        try {
          if (mitigationsModified.value && !data.value.mitigation && mitigations.value.length) {
            const newMitigationId = (await createObject({ endpoint: 'controls', object: newMitigatingAction.value })).resourceId;
            data.value.mitigation = createLink('controls', newMitigationId);
          }

          if (mitigationsModified.value && data.value.mitigation) {
            await link(await useQuerySync(objectQueryDefinitions.queries.fetch, { domain: props.domainId, endpoint: 'controls', id: getEntityDetailsFromLink(data.value.mitigation).id }, queryClient), mitigations.value, true);
          }

          if (props.scenarioId) {
            await updateRisk({ endpoint: route.params.objectType, id: props.objectId, scenarioId: props.scenarioId, risk: data.value });
          } else {
            await createRisk({ endpoint: route.params.objectType, objectId: props.objectId, risk: data.value });
          }
          displaySuccessMessage(props.scenarioId ? upperFirst(t('riskUpdated').toString()) : upperFirst(t('riskCreated').toString()));
        } catch (e: any) {
          displayErrorMessage(upperFirst(t('riskNotSaved').toString()), e.message);
        } finally {
          savingRisk.value = false;
        }
      }
    };

    // Mitigating action stuff
    const mitigations = ref<IVeoEntity[]>([]);

    const mitigationsModified = ref(false);
    const onMitigationsModified = (value: boolean) => {
      mitigationsModified.value = value;
      validate();
    };

    const onMitigationsChanged = (newMitigation: IVeoEntity[]) => {
      mitigations.value = newMitigation;
      dirtyFields.value.mitigation = true;
    };

    const newMitigatingAction = computed(() => ({
      type: 'control',
      name: t('mitigatingAction', [data.value?.designator]).toString(),
      owner: {
        targetUri: `${config.public.apiUrl}/units/${route.params.unit}`
      },
      domains: {
        [props.domainId]: {
          subType: 'CTL_TOM',
          status: 'NEW'
        }
      }
    }));

    return {
      ability,
      data,
      dirtyFields,
      domain,
      formDisabled,
      formIsValid,
      formModified,
      mitigations,
      mitigationsModified,
      newMitigatingAction,
      onMitigationsChanged,
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

const makeRiskObject = (initialData: IVeoRisk | undefined, domainId: string, riskDefinitions: { [key: string]: IVeoDomainRiskDefinition }): IVeoRisk => {
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

    for (const category of riskDefinitions[riskDefinition].categories.map((category) => category.id)) {
      const impactValueObject = {
        category,
        effectiveImpact: undefined,
        specificImpact: undefined,
        specificImpactExplanation: undefined,
        potentialImpact: undefined
      };
      if (!mergedObject.domains[domainId].riskDefinitions[riskDefinition].impactValues.find((impactValue: any) => impactValue.category === category)) {
        mergedObject.domains[domainId].riskDefinitions[riskDefinition].impactValues.push(impactValueObject);
      } else {
        merge(
          mergedObject.domains[domainId].riskDefinitions[riskDefinition].impactValues.find((impactValue: any) => impactValue.category === category),
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
      if (!mergedObject.domains[domainId].riskDefinitions[riskDefinition].riskValues.find((riskValue: any) => riskValue.category === category)) {
        mergedObject.domains[domainId].riskDefinitions[riskDefinition].riskValues.push(riskValueObject);
      } else {
        merge(
          mergedObject.domains[domainId].riskDefinitions[riskDefinition].riskValues.find((impactValue: any) => impactValue.category === category),
          riskValueObject
        );
      }
    }
  }
  return mergedObject;
};
</script>

<i18n>
{
  "en": {
    "common": "common",
    "computedValues": "Some values are computed in the backend.",
    "computedValuesCTA": "Please press \"Save\" to recompute these values.",
    "createRisk": "create risk",
    "editRisk": "edit risk \"{0}\"",
    "mitigatingAction": "Mitigating action for \"{0}\"",
    "riskCreated": "the risk was created successfully",
    "riskUpdated": "the risk was edited successfully",
    "riskNotSaved": "the risk couldn't be saved",
    "riskOwner": "risk owner",
    "scenarioRequired": "A risk scenario has to be selected"
  },
  "de": {
    "common": "allgemein",
    "computedValues": "Einige Werte werden automatisch berechnet.",
    "computedValuesCTA": "Drücken sie \"Speichern\" um diese Werte neu berechnen zu lassen.",
    "createRisk": "Risiko erstellen",
    "editRisk": "Risiko \"{0}\" bearbeiten",
    "mitigatingAction": "Mitigierende Maßnahme für \"{0}\"",
    "riskCreated": "das Risiko wurde erfolgreich erstellt",
    "riskUpdated": "das Risiko wurde erfolgreich bearbeitet",
    "riskNotSaved": "das Risiko konnte nicht gespeichert werden",
    "riskOwner": "Verantwortlicher",
    "scenarioRequired": "Es muss ein Szenario ausgewählt werden"
  }
}
</i18n>
