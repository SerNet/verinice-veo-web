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
        <h2 class="text-h2 mt-4">
          {{ upperFirst(t('mitigationSection').toString()) }}
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-icon v-on="on">
                {{ mdiInformationOutline }}
              </v-icon>
            </template>
            <template #default>
              <i18n
                path="mitigationAreaOfApplicationExplanation"
                tag="span"
              >
                <br>
              </i18n>
            </template>
          </v-tooltip>
        </h2>
        <VeoCard>
          <v-card-text>
            <div class="d-flex fill-width align-center">
              <div>
                <v-radio-group
                  v-model="createNewMitigatingAction"
                  hide-details
                  dense
                >
                  <v-radio
                    :label="t('createNewMitigation')"
                    :value="true"
                  />
                  <v-radio
                    :label="`${t('useExistingMitigation')}:`"
                    :value="false"
                  />
                </v-radio-group>
                <VeoObjectSelect
                  v-model="data.mitigation"
                  object-type="control"
                  :disabled="createNewMitigatingAction"
                  :label="t('mitigation')"
                  value-as-link
                  class="ml-8"
                />
              </div>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <div
                    class="ml-4"
                    v-on="on"
                  >
                    <v-badge
                      :content="mitigationParts.length + ''"
                      overlap
                    >
                      <v-btn
                        icon
                        :disabled="fetchingMitigation"
                        @click="editPartsDialogVisible = true"
                      >
                        <v-icon>
                          {{ mdiFileDocumentMultiple }}
                        </v-icon>
                      </v-btn>
                    </v-badge>
                  </div>
                </template>
                <template #default>
                  {{ upperFirst(t('editParts').toString()) }}
                </template>
              </v-tooltip>
            </div>
            <VeoLinkObjectDialog
              v-model="editPartsDialogVisible"
              add-type="entity"
              :edited-object="createNewMitigatingAction ? newMitigatingAction : data.mitigation"
              return-objects
              :selected-items.sync="mitigationParts"
            />
          </v-card-text>
        </VeoCard>
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
import { computed, defineComponent, nextTick, ref, useContext, useFetch, useRoute, watch } from '@nuxtjs/composition-api';
import { merge, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiFileDocumentMultiple, mdiInformationOutline } from '@mdi/js';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoDomain, IVeoEntity, IVeoRisk, VeoAlertType } from '~/types/VeoTypes';
import { IVeoAPIObjectIdentifier, useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';

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
    const { $config, $api } = useContext();
    const { t } = useI18n();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { createLink, linkObject } = useVeoObjectUtilities();

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
      () => fetchDomain(),
      { immediate: true }
    );

    watch(
      () => props.value,
      (newValue) => {
        if (newValue) {
          makeRiskObject(risk?.value, props.domainId, Object.keys(domain.value?.riskDefinitions || {}));
        }
      },
      {
        immediate: true
      }
    );

    const data = ref<IVeoRisk | undefined>(undefined);
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
      if (data.value) {
        savingRisk.value = true;

        try {
          const mitigationDetails = { type: 'control', id: data.value.mitigation ? getEntityDetailsFromLink(data.value.mitigation).id : undefined };
          if (createNewMitigatingAction.value === true) {
            const newMitigationId = (await $api.entity.create('control', newMitigatingAction.value as any)).resourceId;
            mitigationDetails.id = newMitigationId;
            data.value.mitigation = await createLink(mitigationDetails as IVeoAPIObjectIdentifier);
          }
          await linkObject('child', mitigationDetails as IVeoAPIObjectIdentifier, mitigationParts.value, true);

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
    const createNewMitigatingAction = ref(true);
    const newMitigatingAction = computed(() => ({
      type: 'control',
      name: t('mitigatingAction', [data.value?.scenario?.displayName]).toString(),
      owner: {
        targetUri: `${$config.apiUrl}/units/${separateUUIDParam(route.value.params.unit).id}`
      }
    }));

    const editPartsDialogVisible = ref(false);

    const selectedMitigationAsEntity = ref<IVeoEntity | undefined>(undefined);
    const fetchingMitigation = ref(false);

    const mitigationParts = ref<{ type: string; id: string }[]>([]);

    const fetchMitigation = async () => {
      if (data.value?.mitigation) {
        fetchingMitigation.value = true;
        const { id } = getEntityDetailsFromLink(data.value.mitigation);

        try {
          selectedMitigationAsEntity.value = await $api.entity.fetch('control', id);

          mitigationParts.value = selectedMitigationAsEntity.value.parts.map((part) => getEntityDetailsFromLink(part));
        } finally {
          fetchingMitigation.value = false;
        }
      } else {
        mitigationParts.value = [];
      }
    };

    watch(
      () => createNewMitigatingAction.value,
      (newValue) => {
        if (newValue) {
          mitigationParts.value = [];
        } else {
          fetchMitigation();
        }
      }
    );

    watch(
      () => data.value?.mitigation,
      () => {
        if (data.value?.mitigation) {
          createNewMitigatingAction.value = false;
        }
        fetchMitigation();
      },
      { immediate: true, deep: true }
    );

    return {
      createNewMitigatingAction,
      data,
      domain,
      editPartsDialogVisible,
      fetchingMitigation,
      formIsDirty,
      formIsValid,
      mitigationParts,
      newMitigatingAction,
      risk,
      saveRisk,
      savingRisk,

      upperFirst,
      t,
      VeoAlertType,
      mdiFileDocumentMultiple,
      mdiInformationOutline
    };
  }
});

const makeRiskObject = (initialData: IVeoRisk | undefined, domainId: string, riskDefinitions: string[]): IVeoRisk => {
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

  for (const riskDefinition of riskDefinitions) {
    object.domains[domainId].riskDefinitions[riskDefinition] = {
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
    "createNewMitigation": "create new mitigating action",
    "createRisk": "create risk",
    "editParts": "edit parts",
    "editRisk": "edit risk \"{0}\"",
    "mitigatingAction": "Mitigating action for \"{0}\"",
    "mitigation": "mitigation",
    "mitigationAreaOfApplicationExplanation": "Mitigating actions are applied across protection goals and risk definitions,{0} meaning only one mitigation action can be applied to a risk",
    "mitigationSection": "risk reduction actions (mitigating actions)",
    "riskCreated": "the risk was created successfully",
    "riskUpdated": "the risk was edited successfully",
    "riskNotSaved": "the risk couldn't be saved",
    "riskOwner": "risk owner",
    "scenarioRequired": "A risk scenario has to be selected",
    "useExistingMitigation": "use existing mitigating action"
  },
  "de": {
    "common": "allgemein",
    "computedValues": "Einige Werte werden automatisch berechnet.",
    "computedValuesCTA": "Drücken sie \"Speichern\" um diese Werte neu berechnen zu lassen.",
    "createNewMitigation": "Neue mitigierende Maßnahme erstellen",
    "createRisk": "Risiko erstellen",
    "editParts": "Teile bearbeiten",
    "editRisk": "Risiko \"{0}\" bearbeiten",
    "mitigatingAction": "Mitigierende Maßnahme für \"{0}\"",
    "mitigation": "Gegenmaßnahme",
    "mitigationAreaOfApplicationExplanation": "Mitigierende Maßnahmen gelten über Schutzziele und Risikodefinitionen hinweg,{0} d.h. es kann immer nur eine migitierende Maßnahme pro Risiko ausgewählt werden",
    "mitigationSection": "Maßnahmen zur Risikoreduktion (Mitigierende Maßnahmen)",
    "riskCreated": "das Risiko wurde erfolgreich erstellt",
    "riskUpdated": "das Risiko wurde erfolgreich bearbeitet",
    "riskNotSaved": "das Risiko konnte nicht gespeichert werden",
    "riskOwner": "Verantwortlicher",
    "scenarioRequired": "Es muss ein Szenario ausgewählt werden",
    "useExistingMitigation": "Vorhandene mitigierende Maßnahme nutzen"
  }
}
</i18n>