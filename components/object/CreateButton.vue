<!--
   - verinice.veo web
   - Copyright (C) 2026 Haneen Husin
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
  <ObjectCreateDialog
    v-if="filter.objectType && createObjectDialogVisible"
    v-model="createObjectDialogVisible"
    :domain-id="domainId"
    :object-type="filter.objectType"
    :display-success-message="true"
    :sub-type="filter.subType || selectedSubtypeForCreateDialog"
  />

  <template v-if="filter.objectType">
    <UtilNestedMenu v-if="!filter.subType && nestedActions.length" location="bottom right" :items="nestedActions">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="mergeProps($attrs, menuProps)"
          color="primary"
          flat
          data-component-name="create-object-button"
          data-veo-test="create-object-button"
          :disabled="!nestedActions.length || !canManageUnitContent"
          :aria-label="
            !canManageUnitContent ? t('permissions.missingPermissionTooltip') : t('createObject', [createObjectLabel])
          "
          :prepend-icon="mdiPlus"
        >
          {{ t('createObject') }}
        </v-btn>
      </template>
    </UtilNestedMenu>

    <v-btn
      v-else
      color="primary"
      flat
      :disabled="!canManageUnitContent"
      data-component-name="create-object-button"
      data-veo-test="create-object-button"
      :aria-label="
        !canManageUnitContent ? t('permissions.missingPermissionTooltip') : t('createObject', [createObjectLabel])
      "
      :prepend-icon="mdiPlus"
      @click="createObjectDialogVisible = true"
    >
      {{ t('createObject', [createObjectLabel]) }}
    </v-btn>
  </template>
</template>
<script setup lang="ts">
import { useQuery } from '~/composables/api/utils/query';
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import { mdiPlus } from '@mdi/js';
import { mergeProps } from 'vue';
import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import type { INestedMenuEntries } from '~/components/util/NestedMenu.vue';
import type { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';

const props = defineProps<{
  filter;
}>();

const route = useRoute();
const { t, locale } = useI18n();
const { data: translations } = useTranslations();
const domainId = computed(() => route.params.domain as string);

const { ability, subject } = useVeoPermissions();
const createObjectDialogVisible = ref(false);
const canManageUnitContent = computed(() =>
  ability.value.can('manage', subject('units', { id: route.params.unit as string }))
);

const formsQueryParameters = computed(() => ({ domainId: domainId.value }));
const formsQueryEnabled = computed(() => !!domainId.value);
const { data: formSchemas } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, {
  enabled: formsQueryEnabled,
  placeholderData: []
});

const selectedSubtypeForCreateDialog = ref<string>('');

const nestedActions = computed<INestedMenuEntries[]>(() => {
  return formSchemas.value
    ?.filter((formschema) => formschema.modelType === props.filter.objectType)
    .map((f) => ({
      key: f.id,
      title: f.name[locale.value],
      icon: OBJECT_TYPE_ICONS.get(props.filter.objectType)?.icon as string,
      subType: f.subType,
      callback: (entry: INestedMenuEntries) => {
        selectedSubtypeForCreateDialog.value = entry.subType;
        createObjectDialogVisible.value = true;
      }
    }));
});

const createObjectLabel = computed(() =>
  props.filter.subType ?
    formatObjectLabel('subType', props.filter.subType)
  : formatObjectLabel('objectType', props.filter.objectType)
);

const formatObjectLabel = (label: string, value?: string) => {
  switch (label) {
    // translated object type
    case 'objectType':
      return value ? translations.value?.lang[locale.value]?.[value] : undefined;
    // translated sub type
    case 'subType':
      return (
        (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.subType === value)?.name?.[
          locale.value
        ] || value
      );
  }
};
</script>
<style scoped lang="scss"></style>
<i18n src="~/locales/base/pages/unit-domains-domain-object-type-sub-type-index.json"></i18n>
