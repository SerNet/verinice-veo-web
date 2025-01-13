<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div v-if="isBetaMode">
    <v-switch
      color="primary"
      :label="featureFlags[featureKey] ? label.on : label.off"
      class="d-flex justify-start mr-4 mb-0"
      hide-details
      :model-value="featureFlags[featureKey]"
      @change="toggleFeatureFlag"
    ></v-switch>
  </div>
</template>

<script setup lang="ts">
import { FeatureFlagName, useFeatureFlag } from '~/composables/features/featureFlag';

type Label = { on: string; off: string };

const props = defineProps<{
  featureKey: FeatureFlagName;
  label: Label;
}>();

const { featureFlags, toggleFeature, isBetaMode } = useFeatureFlag();

const toggleFeatureFlag = () => {
  toggleFeature(props.featureKey);
};
</script>
