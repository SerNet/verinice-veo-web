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
      <v-form
        v-if="data"
        v-model="formIsValid"
      >
        <h2 class="text-h2 mb-2">
          {{ upperFirst(t('common').toString()) }}
        </h2>
        <VeoCard>
          <v-card-text>
            <VeoObjectSelect
              v-model="data.scenario"
              object-type="scenario"
              required
              sub-type="SCN_Scenario"
              :domain-id="domainId"
              value-as-link
            />
            <v-row>
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
              <v-col
                xs="12"
                md="6"
              >
                <VeoObjectSelect
                  v-model="data.mitigation"
                  object-type="control"
                  :label="t('mitigation')"
                  value-as-link
                />
              </v-col>
            </v-row>
          </v-card-text>
        </VeoCard>
        <VeoCreateRiskDialogRiskDefinitions
          v-model="data.domains[domainId].riskDefinitions"
          :domain="domain"
        />
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn
        v-cy-name="'cancel-button'"
        text
        :disabled="savingRisk"
        @click="dialog = false"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
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
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { useContext, useFetch } from '@nuxtjs/composition-api';
import { computed, defineComponent, PropType, ref, watch } from '@vue/composition-api';
import { merge, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { getEntityDetailsFromLink } from '~/lib/utils';

import { IVeoDomain, IVeoRisk } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    risk: {
      type: Object as PropType<IVeoRisk>,
      default: undefined
    },
    domainId: {
      type: String,
      required: true
    },
    objectType: {
      type: String,
      required: true
    },
    objectId: {
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

    // Domain stuff, used for risk definitions
    const domain = ref<IVeoDomain | undefined>();
    const { fetch: fetchDomain } = useFetch(async () => {
      domain.value = await $api.domain.fetch(props.domainId);
      data.value = makeRiskObject(data.value, props.domainId, Object.keys(domain.value?.riskDefinitions || {}));
    });
    watch(
      () => props.domainId,
      () => fetchDomain()
    );

    const formIsValid = ref(false);
    const formIsDirty = ref(false);

    const data = ref<IVeoRisk>(makeRiskObject({} as any, props.domainId, Object.keys(domain.value?.riskDefinitions || {})));
    watch(
      () => props.risk,
      (newValue) => {
        data.value = makeRiskObject(newValue, props.domainId, Object.keys(domain.value?.riskDefinitions || {}));
        formIsValid.value = false;
        formIsDirty.value = false;
      },
      {
        deep: true,
        immediate: true
      }
    );

    const savingRisk = ref(false);
    const saveRisk = async () => {
      savingRisk.value = true;

      try {
        if (props.risk) {
          const { id } = getEntityDetailsFromLink(props.risk.scenario);
          await $api.entity.updateRisk(props.objectType, props.objectId, id, data.value);
        } else {
          await $api.entity.createRisk(props.objectType, props.objectId, data.value);
        }
        displaySuccessMessage(props.risk ? upperFirst(t('riskUpdated').toString()) : upperFirst(t('riskCreated').toString()));
      } catch (e) {
        displayErrorMessage(upperFirst(t('riskNotSaved').toString()), JSON.stringify(e));
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
      saveRisk,
      savingRisk,

      upperFirst,
      t
    };
  }
});

const makeRiskObject = (initialData: IVeoRisk, domainId: string, riskDefinition: string[]): IVeoRisk => {
  const object: any = merge(
    {
      scenario: undefined,
      mitigation: undefined,
      riskOwner: undefined,
      process: undefined,
      domains: {
        [domainId]: {
          riskDefinitions: {}
        }
      }
    },
    initialData
  );

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

  return object;
};
</script>

<i18n>
{
  "en": {
    "common": "common",
    "createRisk": "create risk",
    "editRisk": "edit risk \"{0}\"",
    "mitigation": "mitigation",
    "riskCreated": "the risk was created successfully",
    "riskEdited": "the risk was edited successfully",
    "riskNotSaved": "the risk couldn't be saved",
    "riskOwner": "risk owner"
  },
  "de": {
    "common": "allgemein",
    "createRisk": "Risiko erstellen",
    "editRisk": "Risiko \"{0}\" bearbeiten",
    "mitigation": "Gegenmaßnahme",
    "riskCreated": "das Risiko wurde erfolgreich erstellt",
    "riskEdited": "das Risiko wurde erfolgreich bearbeitet",
    "riskNotSaved": "das Risiko konnte nicht gespeichert werden",
    "riskOwner": "Verantwortlicher"
  }
}
</i18n>