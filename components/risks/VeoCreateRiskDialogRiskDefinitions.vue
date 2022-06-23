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
      <VeoTabs v-model="activeTab">
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
          v-if="!!domain"
          #items
        >
          <v-tab-item
            v-for="riskDefinition of domain.riskDefinitions"
            :key="riskDefinition.id"
          >
            <VeoRiskProbabilitySection
              :dirty-fields="dirtyFields"
              :risk-definition="riskDefinition"
              :data.sync="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].probability"
              @update:dirty-fields="$emit('update:dirty-fields', $event)"
            />
            <VeoRiskImpactSection
              :dirty-fields="dirtyFields"
              :risk-definition="riskDefinition"
              :data.sync="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].impactValues"
              @update:dirty-fields="$emit('update:dirty-fields', $event)"
            />
            <VeoInherentRiskSection
              :dirty-fields="dirtyFields"
              :risk-definition="riskDefinition"
              :data.sync="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues"
              @update:dirty-fields="$emit('update:dirty-fields', $event)"
            />
            <VeoRiskTreatmentSection
              :dirty-fields="dirtyFields"
              :risk-definition="riskDefinition"
              :data.sync="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues"
              @update:dirty-fields="$emit('update:dirty-fields', $event)"
            />
            <VeoRiskMitigationSection
              :data="internalValue"
              :mitigations.sync="_mitigations"
              :domain-id="domain.id"
              v-on="$listeners"
            />
            <VeoRiskResidualSection
              :risk-definition="riskDefinition"
              :data.sync="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues"
            />
          </v-tab-item>
        </template>
      </VeoTabs>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from '@nuxtjs/composition-api';

import { IDirtyFields } from './VeoCreateRiskDialogSingle.vue';
import { IVeoDomain, IVeoEntity, IVeoRisk } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<IVeoRisk>,
      required: true
    },
    domain: {
      type: Object as PropType<IVeoDomain>,
      default: () => undefined
    },
    dirtyFields: {
      type: Object as PropType<IDirtyFields>,
      default: () => {}
    },
    mitigations: {
      type: Array as PropType<IVeoEntity[]>,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const internalValue = computed({
      get() {
        return props.value;
      },
      set(newValue: IVeoRisk) {
        emit('input', newValue);
      }
    });

    // layout stuff
    const getRiskValuesByProtectionGoal = (riskDefinition: IVeoRisk['domains']['x']['riskDefinitions']['y'], protectionGoal: string) => {
      return riskDefinition.riskValues.find((value) => value.category === protectionGoal);
    };

    const activeTab = ref(0);
    const activeRiskDefinition = computed(() => Object.values(props.domain?.riskDefinitions || {})[activeTab.value]);

    // setting residual risk to the inherent risk if no risk treatment is selected
    watch(
      () => internalValue.value.domains[props.domain.id].riskDefinitions[activeRiskDefinition.value.id].riskValues,
      (newValue) => {
        for (const protectionGoalIndex in newValue) {
          if (!internalValue.value.domains[props.domain.id].riskDefinitions[activeRiskDefinition.value.id].riskValues[protectionGoalIndex].riskTreatments.length) {
            internalValue.value.domains[props.domain.id].riskDefinitions[activeRiskDefinition.value.id].riskValues[protectionGoalIndex].userDefinedResidualRisk = undefined;
          }
        }
      },
      { deep: true }
    );

    const _mitigations = computed({
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
      _mitigations
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