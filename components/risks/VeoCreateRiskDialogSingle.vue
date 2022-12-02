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
  <VeoDialog
    :value="value"
    :close-disabled="savingRisk"
    :persistent="savingRisk || !!Object.keys(dirtyFields).length"
    :headline="upperFirst(!!risk ? t('editRisk', [risk.designator]).toString() : t('createRisk').toString())"
    x-large
    fixed-footer
    v-on="$listeners"
  >
    <template #default>
      <VeoAlert
        :value="true"
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
        <VeoCard>
          <v-card-text class="pa-3 px-4">
            <v-row>
              <v-col
                xs="12"
                md="6"
              >
                <VeoObjectSelect
                  :value="data.scenario"
                  object-type="scenario"
                  required
                  :rules="[(data) => !!data || t('scenarioRequired')]"
                  sub-type="SCN_Scenario"
                  :domain-id="domainId"
                  :disabled="formDisabled"
                  value-as-link
                  hide-details
                  @input="onScenarioChanged"
                />
              </v-col>
              <v-col
                xs="12"
                md="6"
              >
                <VeoObjectSelect
                  :value="data.riskOwner"
                  object-type="person"
                  :label="upperFirst(t('riskOwner').toString())"
                  :disabled="formDisabled"
                  value-as-link
                  hide-details
                  @input="onRiskOwnerChanged"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </VeoCard>
        <VeoCreateRiskDialogRiskDefinitions
          :value="data"
          :domain="domain"
          :dirty-fields.sync="dirtyFields"
          :disabled="formDisabled"
          :mitigations="mitigations"
          @update:mitigations="onMitigationsChanged"
          @update:new-mitigating-action="newMitigatingAction = $event"
          @mitigations-modified="mitigationsModified = $event"
          @input="onRiskDefinitionsChanged"
        />
      </v-form>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        v-cy-name="'save-button'"
        text
        color="primary"
        :loading="savingRisk"
        :disabled="!formIsValid || !formModified"
        @click="saveRisk"
      >
        {{ t('global.button.save') }}
      </v-btn>
      <v-btn
        v-cy-name="'close-button'"
        text
        color="primary"
        :disabled="savingRisk"
        @click="$emit('input', false)"
      >
        {{ t('global.button.close') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref, useContext, useFetch, useRoute, watch } from '@nuxtjs/composition-api';
import { cloneDeep, isEqual, merge, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoDomain, IVeoLink, IVeoRisk, IVeoDomainRiskDefinition, VeoAlertType, IVeoEntity } from '~/types/VeoTypes';
import { useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';

export interface IDirtyFields {
  [field: string]: boolean;
}

export default defineComponent({
  props: {
    value: {
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
  setup(props, { emit }) {
    const { $api, $config } = useContext();
    const route = useRoute();
    const { t } = useI18n();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { createLink, linkObject } = useVeoObjectUtilities();
    const { ability } = useVeoPermissions();

    const unitId = computed(() => separateUUIDParam(route.value.params.unit).id);

    const formDisabled = computed(() => ability.value.cannot('manage', 'objects'));

    // Domain stuff, used for risk definitions
    const domain = ref<IVeoDomain | undefined>();
    const { fetch: fetchDomain } = useFetch(async () => {
      domain.value = await $api.domain.fetch(props.domainId);
      data.value = makeRiskObject(risk.value, props.domainId, domain.value?.riskDefinitions || {});
      originalData.value = cloneDeep(data.value);
      nextTick(() => {
        dirtyFields.value = {};
      });
    });
    watch(
      () => props.domainId,
      () => fetchDomain(),
      { immediate: true }
    );

    watch(
      () => props.value,
      (newValue) => {
        if (newValue) {
          makeRiskObject(risk?.value, props.domainId, domain.value?.riskDefinitions || {});
        }
      },
      {
        immediate: true
      }
    );

    const data = ref<IVeoRisk | undefined>(undefined);
    const originalData = ref<IVeoRisk | undefined>(undefined);
    const formIsValid = ref(true);
    const formModified = computed(() => !isEqual(data.value, originalData.value) || mitigationsModified.value);

    // dirty/pristine stuff
    const dirtyFields = ref<IDirtyFields>({});

    const onScenarioChanged = (newValue: IVeoLink) => {
      if (data.value) {
        data.value.scenario = newValue;
        dirtyFields.value.scenario = true;
      }
    };

    const onRiskOwnerChanged = (newValue: IVeoLink) => {
      if (data.value) {
        data.value.riskOwner = newValue;
      }
    };

    const onRiskDefinitionsChanged = (newValue: IVeoRisk) => {
      data.value = newValue;
    };

    const risk = ref<IVeoRisk | undefined>(undefined);
    const { fetch: fetchRisk } = useFetch(async () => {
      if (props.scenarioId) {
        risk.value = await $api.entity.fetchRisk(props.objectType, props.objectId, props.scenarioId);
      } else {
        risk.value = undefined;
      }

      data.value = makeRiskObject(risk.value, props.domainId, domain.value?.riskDefinitions || {});
      originalData.value = cloneDeep(data.value);
      formIsValid.value = true;

      nextTick(() => {
        dirtyFields.value = {};
      });
    });
    watch(
      () => props.scenarioId,
      () => fetchRisk()
    );

    const savingRisk = ref(false);
    const saveRisk = async () => {
      if (data.value) {
        savingRisk.value = true;

        try {
          if (!data.value.mitigation && mitigations.value.length) {
            const newMitigationId = (await $api.entity.create('control', newMitigatingAction.value as any)).resourceId;
            data.value.mitigation = await createLink({ type: 'control', id: newMitigationId });
          }

          if (data.value.mitigation) {
            await linkObject('child', { id: getEntityDetailsFromLink(data.value.mitigation).id, type: 'control' }, mitigations.value, true);
          }

          if (props.scenarioId) {
            await $api.entity.updateRisk(props.objectType, props.objectId, props.scenarioId, data.value);
          } else {
            await $api.entity.createRisk(props.objectType, props.objectId, data.value);
          }
          displaySuccessMessage(props.scenarioId ? upperFirst(t('riskUpdated').toString()) : upperFirst(t('riskCreated').toString()));
          fetchRisk();
          emit('reload');
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

    const onMitigationsChanged = (newMitigation: IVeoEntity[]) => {
      mitigations.value = newMitigation;
      dirtyFields.value.mitigation = true;
    };

    const newMitigatingAction = computed(() => ({
      type: 'control',
      name: t('mitigatingAction', [data.value?.designator]).toString(),
      owner: {
        targetUri: `${$config.apiUrl}/units/${unitId.value}`
      },
      domains: {
        [props.domainId]: {
          subType: 'CTL_TOM',
          status: 'NEW'
        }
      }
    }));

    return {
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
      onRiskDefinitionsChanged,
      onRiskOwnerChanged,
      onScenarioChanged,
      risk,
      saveRisk,
      savingRisk,

      upperFirst,
      t,
      VeoAlertType
    };
  }
});

const makeRiskObject = (initialData: IVeoRisk | undefined, domainId: string, riskDefinitions: { [key: string]: IVeoDomainRiskDefinition }): IVeoRisk => {
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

  const mergedObject = initialData ? merge(initialData, object) : object;

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

  return initialData ? merge(initialData, object) : object;
};
</script>

<i18n>
{
  "en": {
    "common": "common",
    "computedValues": "Some values are computed in the backend.",
    "computedValuesCTA": "Please press \"Save\" to recomputed those values.",
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