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
  <div class="targets-tab">
    <slot :actions="actions"></slot>
  </div>
</template>

<script setup lang="ts">
import { mdiLinkPlus } from '@mdi/js';
import { computed, inject, ref } from 'vue';
import { IVeoEntity } from '~/types/VeoTypes';

// Define props
const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:addEntityDialog', updatedDialog: any): void;
}>();

// Composables & Utilities
const t: any = inject('t');

// State
const linkDialogKey = ref(0);

// Helper Functions
const forceRerender = () => {
  linkDialogKey.value += 1;
};

// Action Handlers
const openLinkObjectDialog = (objectType?: string) => {
  const updatedDialog = {
    object: props.object,
    editRelationship: objectType,
    value: true,
    editParents: true,
    preselectedItems: [],
    returnObjects: false,
    preselectedFilters: { objectType },
    disabledFields: ['objectType'],
    linkRiskAffected: true
  };
  emit('update:addEntityDialog', updatedDialog);
  forceRerender();
};

const linkScopeAction = () => openLinkObjectDialog('scope');
const linkAssetAction = () => openLinkObjectDialog('asset');
const linkProcessAction = () => openLinkObjectDialog('process');

// Computed Properties
const actions = computed(() => [
  {
    key: 'linkScope',
    title: computed(() => t('linkScope')),
    icon: mdiLinkPlus,
    action: linkScopeAction
  },
  {
    key: 'linkProcess',
    title: computed(() => t('linkProcess')),
    icon: mdiLinkPlus,
    action: linkProcessAction
  },
  {
    key: 'linkAsset',
    title: computed(() => t('linkAsset')),
    icon: mdiLinkPlus,
    action: linkAssetAction
  }
]);
</script>
