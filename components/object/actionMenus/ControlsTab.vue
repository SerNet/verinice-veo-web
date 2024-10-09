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
const { locale } = useI18n();
import { useCurrentDomain } from '~/composables/index';
import { IVeoControlImplementation, IVeoEntity, IVeoLink } from '~/types/VeoTypes';

// Define props
const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

// Define emits
const emit = defineEmits(['update:addEntityDialog']);

// Dependency injection
const t: any = inject('t');

const { data: currentDomain } = useCurrentDomain();

const complianceControlSubType = computed(
  () => currentDomain.value.raw.controlImplementationConfiguration.complianceControlSubType
);

// Function to open the link object dialog
const openLinkObjectDialog = (objectType?: string) => {
  const updatedDialog = {
    object: props.object,
    editRelationship: objectType,
    value: true,
    editParents: true,
    preselectedItems: getPreselectedItems(),
    returnObjects: true, // explicitly setting it to true
    preselectedFilters: { subType: complianceControlSubType.value },
    disabledFields: ['subType', 'objectType'],
    linkRiskAffected: false
  };
  emit('update:addEntityDialog', updatedDialog);
};

// Callback for linking object
const linkObjectCallback = () => {
  openLinkObjectDialog('control');
};

// Get preselected items for the link dialog
const getPreselectedItems = (): IVeoLink[] => {
  return (props.object?.controlImplementations ?? []).map((ci: IVeoControlImplementation) => ci.control);
};

// Define actions for parent objects
const actions = computed(() => [
  {
    key: 'linkObject',
    title: computed(() =>
      t('linkControl', [
        currentDomain.value.raw.elementTypeDefinitions.control.translations[locale.value][
          `control_${complianceControlSubType.value}_plural`
        ]
      ])
    ),
    icon: mdiLinkPlus,
    tab: ['controls'],
    objectTypes: ['entity'],
    action: linkObjectCallback
  }
]);
</script>
