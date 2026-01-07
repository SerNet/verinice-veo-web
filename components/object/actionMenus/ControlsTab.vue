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

    <ObjectAddObjectDialog
      v-model="unifiedDialogState.visible"
      :domain-id="domainId"
      object-type="control"
      :parent-object="object"
      :edit-parents="true"
      :multi-select="true"
      :allow-select="true"
      :allow-create="false"
      :initial-tab="'select'"
      :preselected-filters="{ subType: selectedSubType }"
      :disabled-fields="['subType', 'objectType']"
      :on-link="handleLink"
      @success="onSuccess"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCurrentDomain } from '~/composables/index';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuerySync } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQueryClient } from '@tanstack/vue-query';
import { useCreateLink } from '~/composables/VeoObjectUtilities';
import type { IVeoEntity, IVeoControlImplementation } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import { upperFirst } from 'lodash';

const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  reload: [];
}>();

const route = useRoute();
const queryClient = useQueryClient();
const { t, locale } = useI18n();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
const { createLink } = useCreateLink();
const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);
const { data: currentDomain } = useCurrentDomain();

const unifiedDialogState = ref({ visible: false });
const selectedSubType = ref<string | undefined>(undefined);

const domainId = computed(() => route.params.domain as string);

const complianceControlSubTypes = computed(
  () => currentDomain.value?.raw?.controlImplementationConfiguration?.complianceControlSubTypes || []
);

const openDialogForSubType = (subType: string) => {
  selectedSubType.value = subType;
  unifiedDialogState.value.visible = true;
};

const getSubTypeName = (subType: string): string => {
  const translations = currentDomain.value?.raw?.elementTypeDefinitions?.control?.translations?.[locale.value];
  return translations?.[`control_${subType}_plural`] || subType;
};

const actions = computed(() => {
  if (complianceControlSubTypes.value.length > 1) {
    return complianceControlSubTypes.value.map((subType: string) => ({
      key: `linkControl_${subType}`,
      title: computed(() => t('linkControl', [getSubTypeName(subType)])),
      icon: mdiPlus,
      action: () => openDialogForSubType(subType)
    }));
  }

  return [
    {
      key: 'linkControl',
      title: computed(() => t('linkControl')),
      icon: mdiPlus,
      action: () => {
        selectedSubType.value = complianceControlSubTypes.value[0];
        unifiedDialogState.value.visible = true;
      }
    }
  ];
});

const handleLink = async (controls: IVeoEntity[]) => {
  if (!props.object) return;

  const freshParent = await useQuerySync(
    objectQueryDefinitions.queries.fetch,
    {
      domain: domainId.value,
      endpoint: VeoElementTypePlurals[props.object.type],
      id: props.object.id
    },
    queryClient
  );

  const existingControlIds = new Set(
    (freshParent.controlImplementations || []).map((ci: IVeoControlImplementation) =>
      ci.control.targetUri.split('/').pop()
    )
  );

  if (!freshParent.controlImplementations) {
    freshParent.controlImplementations = [];
  }

  for (const control of controls) {
    if (existingControlIds.has(control.id)) continue;

    freshParent.controlImplementations.push({
      control: createLink('controls', control.id)
    });
  }

  await updateObject({
    domain: domainId.value,
    endpoint: VeoElementTypePlurals[props.object.type],
    id: freshParent.id,
    object: freshParent
  });
};

const onSuccess = (objectIds: string[]) => {
  emit('reload');
  const subTypeName = selectedSubType.value ? getSubTypeName(selectedSubType.value) : '';
  displaySuccessMessage(
    upperFirst(
      t('successfullyAdded', {
        name: t('CI', [subTypeName], objectIds.length)
      })
    )
  );
};

const onError = (error: any) => {
  displayErrorMessage(t('controlLinkError'), error.message);
};
</script>

<i18n src="~/locales/base/components/object-action-menu-tabs.json"></i18n>

<style scoped>
.controls-tab {
  position: relative;
}
</style>
