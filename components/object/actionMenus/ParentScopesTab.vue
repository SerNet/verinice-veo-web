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
  <div class="parent-scopes-tab">
    <slot :actions="actions"></slot>

    <!-- @vue-ignore TODO #3066 $route does not exist -->
    <ObjectCreateDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="$route.params.domain"
      :object-type="createObjectDialog.objectType"
      :sub-type="subType"
      :parent-scope-ids="createObjectDialog.parentScopeIds"
      @success="onCreateObjectSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiLinkPlus, mdiPlus } from '@mdi/js';
import { computed, inject } from 'vue';
import { useDialogManager } from '~/composables/dialogs/useDialogManager';
import { IVeoEntity } from '~/types/VeoTypes';

// Define props
const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

// Define emits
const emit = defineEmits(['reload', 'update:addEntityDialog', 'parent-create-success']);

// Composables & Utilities
const t: any = inject('t');
const { createObjectDialog, openCreateObjectDialog } = useDialogManager(props, 'parent');

// Computed Properties
const actions = computed(() => [
  {
    key: 'createScope',
    title: computed(() => t('createScope')),
    icon: mdiPlus,
    action: createScopeAction
  },
  {
    key: 'linkScope',
    title: computed(() => t('linkScope')),
    icon: mdiLinkPlus,
    action: linkScopeAction
  }
]);

// Action Handlers
const createScopeAction = () => openCreateObjectDialog('scope');
const linkScopeAction = () => openLinkObjectDialog('scope', true, 'scope');

const openLinkObjectDialog = (objectType?: string, addAsChild?: boolean, preSelectedFilter?: string) => {
  const updatedDialog = {
    object: props.object,
    editRelationship: objectType,
    value: true,
    editParents: true,
    preselectedItems: [],
    returnObjects: false,
    preselectedFilters: { objectType: preSelectedFilter },
    disabledFields: [],
    linkRiskAffected: false
  };
  emit('update:addEntityDialog', updatedDialog);
};

// Success Handling
const onCreateObjectSuccess = (newObjectId: string) => {
  emit('parent-create-success', newObjectId, createObjectDialog.value);
};
</script>
