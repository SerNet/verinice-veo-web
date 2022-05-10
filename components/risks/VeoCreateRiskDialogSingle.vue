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
    v-model="dialog"
    :close-disabled="savingRisk"
    :persistent="savingRisk || formIsDirty"
    :headline="upperFirst(!!risk ? t('editRisk', [risk.designator]).toString() : t('createRisk').toString())"
    large
    fixed-footer
    v-on="$listeners"
  >
    <template #default>
      <VeoAlert
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
        <h2 class="text-h2 mb-2">
          {{ upperFirst(t('common').toString()) }}
        </h2>
        <VeoCard>
          <v-card-text>
            <v-row>
              <v-col
                xs="12"
                md="6"
              >
                <VeoObjectSelect
                  v-model="data.scenario"
                  object-type="scenario"
                  required
                  :rules="[(data) => !!data || t('scenarioRequired')]"
                  sub-type="SCN_Scenario"
                  :domain-id="domainId"
                  value-as-link
                />
              </v-col>
              <v-col
                xs="12"
                md="6"
              >
                <VeoObjectSelect
                  v-model="data.riskOwner"
                  object-type="person"
                  :label="t('riskOwner')"
                  value-as-link
                />
              </v-col>
            </v-row>
          </v-card-text>
        </VeoCard>
        <VeoCreateRiskDialogRiskDefinitions
          v-model="data"
          :domain="domain"
          :form-is-dirty="formIsDirty"
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
        :disabled="!formIsValid"
        @click="saveRisk"
      >
        {{ t('global.button.save') }}
      </v-btn>
      <v-btn
        v-cy-name="'close-button'"
        text
        color="primary"
        :disabled="savingRisk"
        @click="dialog = false"
      >
        {{ t('global.button.close') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { nextTick } from 'process';
import { useContext, useFetch } from '@nuxtjs/composition-api';
import { computed, defineComponent, ref, watch } from '@vue/composition-api';
import { merge, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { IVeoDomain, IVeoRisk, VeoAlertType } from '~/types/VeoTypes';

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
    const { $api } = useContext();
    const { t } = useI18n();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

    const dialog = computed({
      get() {
        return props.value;
      },
      set(newValue: boolean) {
        emit('input', newValue);
      }
    });

    watch(
      () => dialog.value,
      (newValue) => {
        if (newValue) {
          fetchDomain();
        }
      }
    );

    // Domain stuff, used for risk definitions
    const domain = ref<IVeoDomain | undefined>();
    const { fetch: fetchDomain } = useFetch(async () => {
      domain.value = await $api.domain.fetch(props.domainId);
      data.value = makeRiskObject(risk.value, props.domainId, Object.keys(domain.value?.riskDefinitions || {}));
      nextTick(() => {
        formIsDirty.value = false;
      });
    });
    watch(
      () => props.domainId,
      () => fetchDomain()
    );

    const data = ref<IVeoRisk>(makeRiskObject(undefined, props.domainId, Object.keys(domain.value?.riskDefinitions || {})));
    const formIsValid = ref(true);
    const formIsDirty = ref(false);

    const risk = ref<IVeoRisk | undefined>(undefined);
    const { fetch: fetchRisk } = useFetch(async () => {
      if (props.scenarioId) {
        risk.value = await $api.entity.fetchRisk(props.objectType, props.objectId, props.scenarioId);
      } else {
        risk.value = undefined;
      }

      data.value = makeRiskObject(risk.value, props.domainId, Object.keys(domain.value?.riskDefinitions || {}));
      formIsValid.value = true;

      nextTick(() => {
        formIsDirty.value = false;
      });
    });
    watch(
      () => props.scenarioId,
      () => fetchRisk()
    );

    watch(
      () => data.value,
      () => {
        formIsDirty.value = true;
      },
      { deep: true }
    );

    const savingRisk = ref(false);
    const saveRisk = async () => {
      savingRisk.value = true;

      try {
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
    };

    return {
      data,
      dialog,
      domain,
      formIsDirty,
      formIsValid,
      risk,
      saveRisk,
      savingRisk,

      upperFirst,
      t,
      VeoAlertType
    };
  }
});

const makeRiskObject = (initialData: IVeoRisk | undefined, domainId: string, riskDefinition: string[]): IVeoRisk => {
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

  for (const _riskDefinition of riskDefinition) {
    object.domains[domainId].riskDefinitions[_riskDefinition] = {
      probability: {
        effectiveProbability: undefined,
        potentialProbability: undefined,
        specificProbability: undefined,
        specificProbabilityExplanation: undefined
      },
      impactValues: [
        {
          category: 'C',
          effectiveImpact: undefined,
          specificImpact: undefined,
          specificImpactExplanation: undefined,
          potentialImpact: undefined
        },
        {
          category: 'I',
          effectiveImpact: undefined,
          specificImpact: undefined,
          specificImpactExplanation: undefined,
          potentialImpact: undefined
        },
        {
          category: 'A',
          effectiveImpact: undefined,
          specificImpact: undefined,
          specificImpactExplanation: undefined,
          potentialImpact: undefined
        },
        {
          category: 'R',
          effectiveImpact: undefined,
          specificImpact: undefined,
          specificImpactExplanation: undefined,
          potentialImpact: undefined
        }
      ],
      riskValues: [
        {
          category: 'C',
          residualRisk: undefined,
          residualRiskExplanation: undefined,
          riskTreatments: [],
          riskTreatmentExplanation: undefined
        },
        {
          category: 'I',
          residualRisk: undefined,
          residualRiskExplanation: undefined,
          riskTreatments: [],
          riskTreatmentExplanation: undefined
        },
        {
          category: 'A',
          residualRisk: undefined,
          residualRiskExplanation: undefined,
          riskTreatments: [],
          riskTreatmentExplanation: undefined
        },
        {
          category: 'R',
          residualRisk: undefined,
          residualRiskExplanation: undefined,
          riskTreatments: [],
          riskTreatmentExplanation: undefined
        }
      ]
    };
  }

  return initialData ? merge(object, initialData) : object;
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
    "riskCreated": "das Risiko wurde erfolgreich erstellt",
    "riskUpdated": "das Risiko wurde erfolgreich bearbeitet",
    "riskNotSaved": "das Risiko konnte nicht gespeichert werden",
    "riskOwner": "Verantwortlicher",
    "scenarioRequired": "Es muss ein Szenario ausgewählt werden"
  }
}
</i18n>