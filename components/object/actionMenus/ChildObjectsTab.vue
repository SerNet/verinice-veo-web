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
    <ObjectSelectObjectTypeDialog
      v-if="isScope"
      v-model="selectObjectTypeDialog.visible"
      :title="t('selectObjectType')"
      :description-text="t('selectObjectTypeDescription')"
      :cancel-text="$t('global.button.cancel')"
      :action-button-text="$t('global.button.ok')"
      action="select-entity"
      @select-entity="onObjectTypeSelected(($event as any).type)"
    />

    <ObjectAddObjectDialog
      v-model="unifiedDialogState.visible"
      :domain-id="domainId"
      :object-type="selectedObjectTypeForDialog"
      :parent-object="object"
      :edit-parents="false"
      :multi-select="true"
      :allow-select="true"
      :allow-create="true"
      :parent-scope-ids="parentScopeIds"
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
import { useTranslations } from '~/composables/Translations';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuerySync } from '~/composables/api/utils/query';
import { useQueryClient } from '@tanstack/vue-query';
import type { IVeoEntity } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import { upperFirst } from 'lodash';

const props = defineProps<{
  object?: IVeoEntity;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  reload: [];
  'child-create-success': [id: string];
}>();

const route = useRoute();
const queryClient = useQueryClient();
const { t, locale } = useI18n();
const { link } = useLinkObject();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
const { data: translations } = useTranslations({ domain: route.params.domain as string });

const unifiedDialogState = ref({ visible: false });
const initialTab = ref<'select' | 'create'>('select');
const selectObjectTypeDialog = ref({ visible: false });
const selectedObjectTypeForDialog = ref<string | undefined>(undefined);

const domainId = computed(() => route.params.domain as string);
const isScope = computed(() => props.object?.type === 'scope');
const parentScopeIds = computed(() => {
  return props.object?.type === 'scope' ? [props.object?.id] : [];
});

const actions = computed(() => [
  {
    key: 'addOrLinkObject',
    title: computed(() => t('addOrLinkObject', [getObjectTypeName()])),
    icon: mdiPlus,
    action: openDialog
  }
]);

const getObjectTypeName = () => {
  if (props.object?.type === 'scope') {
    return t('object');
  }
  return translations.value?.lang[locale.value]?.[props.object?.type || ''] || t('object');
};

const openDialog = () => {
  if (isScope.value) {
    selectObjectTypeDialog.value.visible = true;
  } else {
    selectedObjectTypeForDialog.value = props.object?.type;
    initialTab.value = 'select';
    unifiedDialogState.value.visible = true;
  }
};

const onObjectTypeSelected = (type: string) => {
  selectObjectTypeDialog.value.visible = false;
  selectedObjectTypeForDialog.value = type;
  initialTab.value = 'select';
  unifiedDialogState.value.visible = true;
};

const handleLink = async (objects: IVeoEntity[]) => {
  if (!props.object) return;

  const freshParent = await useQuerySync(
    objectQueryDefinitions.queries.fetch,
    {
      domain: route.params.domain as string,
      endpoint: VeoElementTypePlurals[props.object.type],
      id: props.object.id
    },
    queryClient
  );

  await link(freshParent, objects, false);
};

const onSuccess = (objectIds: string[]) => {
  emit('reload');
  displaySuccessMessage(upperFirst(t('successfullyAdded', { name: t('childObjects', objectIds.length) })));
};

const onCreate = (objectId: string, openEditor: boolean) => {
  emit('child-create-success', objectId);
  if (!openEditor) {
    emit('reload');
  }
};

const onError = (error: any) => {
  displayErrorMessage(t('childLinkError'), error.message);
};
</script>

<i18n src="~/locales/base/components/object-action-menu-tabs.json"></i18n>

<style scoped>
.child-objects-tab {
  position: relative;
}
</style>
