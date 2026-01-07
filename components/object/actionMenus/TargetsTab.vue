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

    <ObjectSelectObjectTypeDialog
      :model-value="selectObjectTypeDialog.visible"
      :title="t('selectTargetType')"
      :description-text="t('selectTargetTypeDescription')"
      :cancel-text="$t('global.button.cancel')"
      :action-button-text="$t('global.button.ok')"
      :allowed-object-types="['scope', 'process', 'asset']"
      action="select-entity"
      @update:model-value="onSelectTypeDialogClose"
      @select-entity="onObjectTypeSelected(($event as any).type)"
    />

    <ObjectAddObjectDialog
      v-model="unifiedDialogState.visible"
      :domain-id="domainId"
      :object-type="selectedObjectType"
      :parent-object="object"
      :multi-select="true"
      :allow-select="true"
      :allow-create="false"
      :initial-tab="'select'"
      :fetch-control-implementation-targets="true"
      :on-link="handleLink"
      @success="onSuccess"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { useVeoAlerts } from '~/composables/VeoAlert';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuerySync } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQueryClient } from '@tanstack/vue-query';
import { useCreateLink } from '~/composables/VeoObjectUtilities';
import type { IVeoEntity } from '~/types/VeoTypes';
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
const { t } = useI18n();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
const { createLink } = useCreateLink();
const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);

const unifiedDialogState = ref({ visible: false });
const selectObjectTypeDialog = ref({ visible: false });
const selectedObjectType = ref<string | undefined>(undefined);

const domainId = computed(() => route.params.domain as string);

const actions = computed(() => [
  {
    key: 'linkTarget',
    title: computed(() => t('linkTarget')),
    icon: mdiPlus,
    action: openDialog
  }
]);

const openDialog = () => {
  selectedObjectType.value = undefined;
  selectObjectTypeDialog.value.visible = true;
};

const onSelectTypeDialogClose = (value: boolean) => {
  selectObjectTypeDialog.value.visible = value;
  if (!value) {
    selectedObjectType.value = undefined;
  }
};

const onObjectTypeSelected = (type: string) => {
  selectObjectTypeDialog.value.visible = false;
  selectedObjectType.value = type;
  unifiedDialogState.value.visible = true;
};

const handleLink = async (targetObjects: IVeoEntity[]) => {
  if (!props.object) return;

  for (const target of targetObjects) {
    const fullTarget = await useQuerySync(
      objectQueryDefinitions.queries.fetch,
      {
        domain: domainId.value,
        endpoint: VeoElementTypePlurals[target.type],
        id: target.id
      },
      queryClient
    );

    if (!fullTarget.controlImplementations) {
      fullTarget.controlImplementations = [];
    }

    fullTarget.controlImplementations.push({
      control: createLink('controls', props.object.id)
    });

    await updateObject({
      domain: domainId.value,
      endpoint: VeoElementTypePlurals[target.type],
      id: fullTarget.id,
      object: fullTarget
    });
  }
};

const onSuccess = (objectIds: string[]) => {
  queryClient.invalidateQueries({
    queryKey: ['controlImplementations']
  });

  emit('reload');
  displaySuccessMessage(upperFirst(t('successfullyAdded', { name: t('targetObjects', objectIds.length) })));

  selectedObjectType.value = undefined;
};

const onError = (error: any) => {
  displayErrorMessage(t('targetLinkError'), error.message);
};
</script>

<i18n src="~/locales/base/components/object-action-menu-tabs.json"></i18n>

<style scoped>
.targets-tab {
  position: relative;
}
</style>
