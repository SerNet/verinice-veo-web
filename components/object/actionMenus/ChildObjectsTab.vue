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
  <div class="child-objects-tab">
    <slot :actions="actions"></slot>
    <!-- Create Object Dialog -->
    <ObjectSelectObjectTypeDialog
      v-if="isCreateMode"
      v-model="createEntityDialog.value"
      :title="t('headline_create')"
      :description-text="t('create_entity')"
      :cancel-text="$t('global.button.cancel')"
      :action-button-text="t('create')"
      :action="'create-entity'"
      :event-payload="{ addAsChild: createEntityDialog.eventPayload }"
      @create-entity="createObjectCallback($event.type)"
    />
    <!-- @vue-ignore TODO #3066 $route does not exist -->
    <ObjectSelectObjectTypeDialog
      v-else
      v-model="selectEntityDialog"
      :title="t('headline_select')"
      :description-text="t('select_entity')"
      :cancel-text="$t('global.button.cancel')"
      :action-button-text="t('select')"
      :action="'select-entity'"
      :target-element-type="objectType"
      @select-entity="linkObjectCallback($event.type)"
    />

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
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useDialogManager } from '~/composables/dialogs/useDialogManager';
import type { IVeoEntity, IVeoLink } from '~/types/VeoTypes';

const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
  addEntityDialog: {
    object?: IVeoEntity;
    editRelationship?: string;
    value: boolean;
    editParents: boolean;
    preselectedItems: (IVeoLink | IVeoEntity)[];
    returnObjects: boolean;
    preselectedFilters: Record<string, any>;
    disabledFields: string[];
    linkRiskAffected: boolean;
  };
}>();

const emit = defineEmits(['reload', 'update:addEntityDialog', 'child-create-success']);

// Composables & Utilities
const { locale } = useI18n();
const t: any = inject('t');
const route = useRoute();
const { data: translations } = useTranslations({ domain: route.params.domain as string });
const { createEntityDialog, createObjectDialog, selectEntityDialog, openCreateObjectDialog } = useDialogManager(
  props,
  'child'
);

// Computed properties
const isCreateMode = computed(() => createEntityDialog.value.value);
const objectType = computed(() => props.object?.type);
const subType = computed(() => (props.object?.type !== 'scope' ? props.object?.subType : undefined));

const actions = computed(() => [
  {
    key: 'createObject',
    title: computed(() => t('createObject', [getCreateObjectTranslationParams()])),
    icon: mdiPlus,
    action: createObjectAction
  },
  {
    key: 'linkObject',
    title: computed(() => t('linkObject', [getCreateObjectTranslationParams()])),
    icon: mdiLinkPlus,
    action: linkObjectAction
  }
]);

// Helper functions
const getCreateObjectTranslationParams = () => {
  if (props.object?.type === 'scope') {
    return t('object');
  }
  return translations.value?.lang[locale.value]?.[props.object?.type || ''] || t('object');
};

const determineType = () => {
  return props.object?.type === 'scope' ? undefined : props.object?.type;
};

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
    disabledFields: [],
    linkRiskAffected: false
  };
  emit('update:addEntityDialog', updatedDialog);
};

// Action handlers
const createObjectAction = () => {
  openCreateObjectDialog(props.object?.type === 'scope' ? undefined : props.object?.type);
};

const linkObjectAction = () => {
  if (props.object?.type === 'scope') {
    selectEntityDialog.value = true;
  } else {
    linkObjectCallback(props.object?.type);
  }
};

const linkObjectCallback = (typeTarget: any) => {
  selectEntityDialog.value = false;
  openDialog(determineType(), typeTarget);
};
const createObjectCallback = (typeTarget: any) => {
  createEntityDialog.value.value = false;
  openCreateObjectDialog(typeTarget);
};
const openDialog = (objectType: string, typeTarget?: string) => {
  openLinkObjectDialog(objectType, true, false, typeTarget);
};

// Success handler for object creation
const onCreateObjectSuccess = (newObjectId: string) => {
  emit('child-create-success', newObjectId, createObjectDialog.value);
};
</script>

<style scoped>
.child-objects-tab {
  position: relative;
}
</style>
