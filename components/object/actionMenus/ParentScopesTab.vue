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

    <ObjectAddObjectDialog
      v-model="unifiedDialogState.visible"
      :domain-id="domainId"
      object-type="scope"
      :parent-object="object"
      :edit-parents="true"
      :multi-select="true"
      :allow-select="true"
      :allow-create="true"
      :initial-tab="initialTab"
      :on-link="handleLink"
      @success="onSuccess"
      @create="onCreate"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { useLinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoAlerts } from '~/composables/VeoAlert';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuerySync } from '~/composables/api/utils/query';
import { useQueryClient } from '@tanstack/vue-query';
import type { IVeoEntity } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  reload: [];
  'parent-create-success': [id: string];
}>();

const route = useRoute();
const queryClient = useQueryClient();
const { t } = useI18n();
const { link } = useLinkObject();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

const unifiedDialogState = ref({ visible: false });
const initialTab = ref<'select' | 'create'>('select');

const domainId = computed(() => route.params.domain as string);

const actions = computed(() => [
  {
    key: 'addToScope',
    title: computed(() => t('addToScope')),
    icon: mdiPlus,
    action: openDialog
  }
]);

const openDialog = () => {
  initialTab.value = 'select';
  unifiedDialogState.value.visible = true;
};

const handleLink = async (parentScopes: IVeoEntity[]) => {
  if (!props.object) return;

  for (const scope of parentScopes) {
    const fullScope = await useQuerySync(
      objectQueryDefinitions.queries.fetch,
      {
        domain: domainId.value,
        endpoint: VeoElementTypePlurals[scope.type],
        id: scope.id
      },
      queryClient
    );
    await link(fullScope, props.object);
  }
};

const onSuccess = (objectIds: string[]) => {
  emit('reload');
  displaySuccessMessage(
    objectIds.length > 1 ? t('addedToMultipleScopes', { count: objectIds.length }) : t('addedToScope')
  );
};

const onCreate = (objectId: string, openEditor: boolean) => {
  emit('parent-create-success', objectId);
  if (!openEditor) {
    emit('reload');
  }
};

const onError = (error: any) => {
  displayErrorMessage(t('linkError'), error.message);
};
</script>

<i18n src="~/locales/base/components/object-action-menu-tabs.json"></i18n>

<style scoped>
.parent-scopes-tab {
  position: relative;
}
</style>
