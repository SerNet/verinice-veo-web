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
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { mdiPlus } from '@mdi/js';
import { mergeProps } from 'vue';
import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import type { INestedMenuEntries } from '~/components/util/NestedMenu.vue';

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

const domainQueryParameters = computed(() => ({ id: domainId.value }));
const domainQueryEnabled = computed(() => !!domainId.value);
const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, domainQueryParameters, {
  enabled: domainQueryEnabled
});

const elementTypeDefinition = computed(() =>
  props.filter.objectType ? domain.value?.elementTypeDefinitions?.[props.filter.objectType] : undefined
);

const selectedSubtypeForCreateDialog = ref<string>('');

const nestedActions = computed<INestedMenuEntries[]>(() => {
  const subTypes = elementTypeDefinition.value?.subTypes ?? {};

  return Object.keys(subTypes)
    .sort((a, b) => (subTypes[a]?.sortKey || 0) - (subTypes[b]?.sortKey || 0))
    .map((subType) => ({
      key: subType,
      title: translateSubType(subType),
      icon: OBJECT_TYPE_ICONS.get(props.filter.objectType)?.icon as string,
      subType,
      callback: (entry: INestedMenuEntries) => {
        selectedSubtypeForCreateDialog.value = entry.subType;
        createObjectDialogVisible.value = true;
      }
    }));
});

const translateSubType = (subType: string) =>
  elementTypeDefinition.value?.translations?.[locale.value]?.[`${props.filter.objectType}_${subType}_singular`] ||
  subType;

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
      return value ? translateSubType(value) : undefined;
  }
};
</script>
<style scoped lang="scss"></style>
<i18n src="~/locales/base/pages/unit-domains-domain-object-type-sub-type-index.json"></i18n>
