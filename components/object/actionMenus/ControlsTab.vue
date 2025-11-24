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
  <div class="controls-tab">
    <slot :actions="actions"></slot>
  </div>
</template>

<script setup lang="ts">
import { mdiLinkPlus } from '@mdi/js';
import { computed, inject } from 'vue';
import { useCurrentDomain } from '~/composables/index';
import type { IVeoControlImplementation, IVeoEntity, IVeoLink } from '~/types/VeoTypes';
import type { AddEntityDialogPayload } from './types';
const { locale } = useI18n();

// Define props
const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

// Define emits
const emit = defineEmits<{ 'update:addEntityDialog': [dialog: AddEntityDialogPayload] }>();

// Dependency injection
const t: any = inject('t');

const { data: currentDomain } = useCurrentDomain();

const complianceControlSubTypes = computed(
  () => currentDomain.value?.raw.controlImplementationConfiguration.complianceControlSubTypes || []
);

// Function to open the link object dialog
const openLinkObjectDialog = (objectType?: string, subType?: string) => {
  const updatedDialog = {
    object: props.object,
    editRelationship: objectType,
    value: true,
    editParents: true,
    preselectedItems: getPreselectedItems(),
    returnObjects: true, // explicitly setting it to true
    preselectedFilters: { subType },
    disabledFields: ['subType', 'objectType'],
    linkRiskAffected: false
  };
  emit('update:addEntityDialog', updatedDialog);
};

// Callback for linking object
const linkObjectCallback = (subType?: string) => {
  return () => openLinkObjectDialog('control', subType);
};

// Get preselected items for the link dialog
const getPreselectedItems = (): IVeoLink[] => {
  return (props.object?.controlImplementations ?? []).map((ci: IVeoControlImplementation) => ci.control);
};

// Define actions for parent objects
const actions = computed(() => {
  return complianceControlSubTypes.value.map((subType) => ({
    key: `linkObject_${subType}`,
    title: computed(() =>
      t('linkControl', [
        currentDomain.value.raw.elementTypeDefinitions.control.translations[locale.value][
          `control_${subType}_plural`
        ] || subType
      ])
    ),
    icon: mdiLinkPlus,
    tab: ['controls'],
    objectTypes: ['entity'],
    action: linkObjectCallback(subType)
  }));
});
</script>
