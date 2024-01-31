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
  <div>
    <div class="risk-definitions">
      <BaseTabs v-model="activeTab">
        <!-- Disabled tabs until more risk definitions are available -->
        <!--<template
          v-if="!!domain"
          #tabs
        >
          <v-tab
            v-for="riskDefinition of domain.riskDefinitions"
            :key="riskDefinition.id"
          >
            {{ riskDefinition.id }}
          </v-tab>
        </template>
        <template
          v-else
          #tabs
        >
          <v-tab
            v-for="index in 2"
            :key="index"
            disabled
          >
            <v-skeleton-loader
              height="24px"
              style="border-radius: 999px"
              type="image"
              width="100px"
            />
          </v-tab>
        </template>-->
        <template
          v-if="!!domain && internalValue?.domains[domain.id].riskDefinitions"
          #items>
          <v-window-item
            v-for="riskDefinition of domain.riskDefinitions"
            :key="riskDefinition.id">
            <RiskProbabilitySection
              v-model:data="
                internalValue.domains[domain.id].riskDefinitions[
                  riskDefinition.id
                ].probability
              "
              :dirty-fields="dirtyFields"
              :disabled="disabled"
              :risk-definition="riskDefinition"
              @update:dirty-fields="$emit('update:dirty-fields', $event)" />
            <RiskImpactSection
              v-model:data="
                internalValue.domains[domain.id].riskDefinitions[
                  riskDefinition.id
                ].impactValues
              "
              :dirty-fields="dirtyFields"
              :disabled="disabled"
              :risk-definition="riskDefinition"
              @update:dirty-fields="$emit('update:dirty-fields', $event)" />
            <RiskInherentRiskSection
              v-model:data="
                internalValue.domains[domain.id].riskDefinitions[
                  riskDefinition.id
                ].riskValues
              "
              :dirty-fields="dirtyFields"
              :disabled="disabled"
              :risk-definition="riskDefinition"
              @update:dirty-fields="$emit('update:dirty-fields', $event)" />
            <RiskTreatmentSection
              v-model:data="
                internalValue.domains[domain.id].riskDefinitions[
                  riskDefinition.id
                ].riskValues
              "
              :dirty-fields="dirtyFields"
              :disabled="disabled"
              :risk-definition="riskDefinition"
              @update:dirty-fields="$emit('update:dirty-fields', $event)" />
            <RiskMitigationSection
              v-model:mitigations="localMitigations"
              :data="internalValue"
              :disabled="disabled"
              :domain-id="domain.id"
              v-bind="$attrs" />
            <RiskResidualSection
              v-model:data="
                internalValue.domains[domain.id].riskDefinitions[
                  riskDefinition.id
                ].riskValues
              "
              :risk-definition="riskDefinition"
              :disabled="disabled" />
          </v-window-item>
        </template>
      </BaseTabs>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { cloneDeep } from 'lodash';

import { IDirtyFields } from './CreateDialogSingle.vue';
import { IVeoEntity, IVeoRisk } from '~/types/VeoTypes';
import { IVeoDomain } from '~/composables/api/queryDefinitions/domains';

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<IVeoRisk>,
      required: true
    },
    domain: {
      type: Object as PropType<IVeoDomain>,
      default: () => undefined
    },
    dirtyFields: {
      type: Object as PropType<IDirtyFields>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {}
    },
    mitigations: {
      type: Array as PropType<IVeoEntity[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:mitigations', 'update:model-value', 'update:dirty-fields'],
  setup(props, { emit }) {
    const internalValue = ref<IVeoRisk | undefined>();

    // Internal value is a ref and not a computed, as a computed doesn't pick up changes somewhere deep down in the structure, so we have to explicitly watch deep.
    const ignoreUpdate = ref(false);
    watch(
      () => props.modelValue,
      (newValue) => {
        if (!ignoreUpdate.value) {
          internalValue.value = cloneDeep(newValue);
        }
      },
      { deep: true, immediate: true }
    );
    watch(
      () => internalValue.value,
      (newValue) => {
        ignoreUpdate.value = true;
        emit('update:model-value', newValue);
        nextTick(() => {
          ignoreUpdate.value = false;
        });
      },
      { deep: true }
    );

    // layout stuff
    const getRiskValuesByProtectionGoal = (
      riskDefinition: IVeoRisk['domains']['x']['riskDefinitions']['y'],
      protectionGoal: string
    ) => {
      return riskDefinition.riskValues.find(
        (value) => value.category === protectionGoal
      );
    };

    const activeTab = ref(0);
    const activeRiskDefinition = computed(
      () => Object.values(props.domain?.riskDefinitions || {})[activeTab.value]
    );

    // setting residual risk to the inherent risk if no risk treatment is selected
    watch(
      () =>
        internalValue.value?.domains[props.domain?.id || ''].riskDefinitions[
          activeRiskDefinition.value.id
        ].riskValues,
      (newValue) => {
        for (const protectionGoalIndex in newValue) {
          if (
            !internalValue.value?.domains[props.domain?.id || '']
              .riskDefinitions[activeRiskDefinition.value.id].riskValues[
              protectionGoalIndex
            ].riskTreatments.length
          ) {
            internalValue.value.domains[props.domain?.id || ''].riskDefinitions[
              activeRiskDefinition.value.id
            ].riskValues[protectionGoalIndex].userDefinedResidualRisk =
              undefined;
          }
        }
      },
      { deep: true }
    );

    const localMitigations = computed({
      get() {
        return props.mitigations;
      },
      set(newValue: IVeoEntity[]) {
        emit('update:mitigations', newValue);
      }
    });

    return {
      activeTab,
      activeRiskDefinition,
      getRiskValuesByProtectionGoal,
      internalValue,
      localMitigations
    };
  }
});
</script>

<style lang="scss" scoped>
.risk-definitions {
  border-radius: 16px;
  overflow: hidden;
}
</style>
