<!--
   - verinice.veo web
   - Copyright (C) 2024 Aziz Khalledi
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
  <div class="risks-tab">
    <slot :actions="actions"></slot>

    <!-- @vue-ignore TODO #3066 $route does not exist -->
    <RiskCreateDialog
      v-if="object && createRiskDialogVisible"
      v-model="createRiskDialogVisible"
      :domain-id="$route.params.domain"
      :object-id="object.id"
      @success="onCreateRiskSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { computed, inject, ref } from 'vue';
import type { IVeoEntity } from '~/types/VeoTypes';

// Define props
defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

// Composables & Utilities
const t: any = inject('t');

// State
const createRiskDialogVisible = ref(false);

// Computed Properties
const actions = computed(() => [
  {
    key: 'createRisk',
    title: computed(() => t('createRisk')),
    icon: mdiPlus,
    action: onCreateRisk
  }
]);

// Action Handlers
const onCreateRisk = () => {
  createRiskDialogVisible.value = true;
};

// Success Handling
const onCreateRiskSuccess = () => {
  createRiskDialogVisible.value = false;
};
</script>
