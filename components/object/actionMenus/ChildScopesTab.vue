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
  <div class="child-scopes-tab">
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

const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

const emit = defineEmits(['reload', 'update:addEntityDialog', 'child-create-success']);

// Composables & Utilities
const t: any = inject('t');
const { createObjectDialog, openCreateObjectDialog } = useDialogManager(props, 'child');

// Dialog opening functions
const openLinkObjectDialog = (
  objectType?: string,
  addAsChild: boolean = false,
  isControlImplementation: boolean = false,
  preSelectedFilter: string = ''
) => {
  const updatedDialog = {
    object: props.object,
    editRelationship: objectType,
    value: true,
    editParents: !addAsChild,
    preselectedItems: [],
    returnObjects: isControlImplementation,
    preselectedFilters: { objectType: preSelectedFilter },
    disabledFields: ['objectType'],
    linkRiskAffected: false
  };
  emit('update:addEntityDialog', updatedDialog);
};

// Action definitions
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

// Action handlers
const createScopeAction = () => openCreateObjectDialog('scope');
const linkScopeAction = () => openLinkObjectDialog('scope', true, false, 'scope');

// Success handler for object creation
const onCreateObjectSuccess = (newObjectId: string) => {
  emit('child-create-success', newObjectId, createObjectDialog.value);
};
</script>
