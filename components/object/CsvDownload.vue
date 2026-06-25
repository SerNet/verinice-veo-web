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

<template v-if="filter.objectType">
  <UtilNestedMenu v-if="nestedActions.length" location="bottom right" :items="nestedActions">
    <template #activator="{ props: menuProps }">
      <v-tooltip location="start" :aria-label="t('createObject')">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="mergeProps($attrs, menuProps, tooltipProps)"
            color="primary"
            variant="outlined"
            data-component-name="create-object-button"
            data-veo-test="create-object-button"
            :disabled="!nestedActions.length || !canManageUnitContent"
            :aria-label="
              !canManageUnitContent ? t('permissions.missingPermissionTooltip') : t('createObject', [createObjectLabel])
            "
            :prepend-icon="mdiDownload"
          >
            {{ t('download') }}
          </v-btn>
        </template>

        <span>{{ t('export.download.tooltip') }}</span>
      </v-tooltip>
    </template>
  </UtilNestedMenu>
</template>

<script setup lang="ts">
import { useQuery } from '~/composables/api/utils/query';
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import type { INestedMenuEntries } from '~/components/util/NestedMenu.vue';
import type { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import { mergeProps } from 'vue';
import { mdiDownload } from '@mdi/js';
import { ELEMENT_DETAILS_CONTEXT } from '~/types/VeoTypes';
import { extractFormScopeAttributeKeys, extractImportableCustomAttributes } from '~/composables/csv/objectImport';
import { until } from '@vueuse/core';
import { buildRows, escapeCSV } from '~/composables/csv/csvExport';

const { t, locale } = useI18n();
const props = defineProps<{
  filter;
}>();

const route = useRoute();
const { data: translations } = useTranslations();
const domainId = computed(() => route.params.domain as string);
const { ability, subject } = useVeoPermissions();
const createObjectDialogVisible = ref(false);
const canManageUnitContent = computed(() =>
  ability.value.can('manage', subject('units', { id: route.params.unit as string }))
);
const { data: currentDomain } = useCurrentDomain();
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
      callback: async (entry: INestedMenuEntries) => {
        selectedSubtypeForCreateDialog.value = entry.subType;
        createObjectDialogVisible.value = true;
        await exportToCSV(entry.subType);
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
    case 'objectType':
      return value ? translations.value?.lang[locale.value]?.[value] : undefined;
    case 'subType':
      return (
        (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.subType === value)?.name?.[
          locale.value
        ] || value
      );
  }
};

const objectType = props.filter.objectType;

const selectedFormSchemaId = computed(() => {
  if (!props.filter.objectType || !selectedSubtypeForCreateDialog.value) {
    return undefined;
  }

  const schemas = formSchemas.value as IVeoFormSchemaMeta[] | undefined;
  const found = schemas?.find(
    (form) =>
      form.modelType === props.filter.objectType &&
      form.subType === selectedSubtypeForCreateDialog.value &&
      form.context === ELEMENT_DETAILS_CONTEXT
  );
  return found?.id;
});

const formQueryParameters = computed(() => ({ id: selectedFormSchemaId.value as string }));
const formQueryEnabled = computed(() => !!selectedFormSchemaId.value);
const { data: selectedFormSchema } = useQuery(formQueryDefinitions.queries.fetchForm, formQueryParameters, {
  enabled: formQueryEnabled
});

const subTypeAttributeKeys = computed(() => {
  return extractFormScopeAttributeKeys(selectedFormSchema.value?.content);
});

const customAttributes = computed(() => {
  const schemaReady = !!selectedFormSchema.value;
  const subtypeReady = !!selectedSubtypeForCreateDialog.value;

  if (!schemaReady || !subtypeReady) return [];

  const typeDef = currentDomain.value?.raw?.elementTypeDefinitions?.[objectType];
  if (!typeDef) return [];

  const translations = typeDef.translations?.[locale.value] || typeDef.translations?.['de'] || {};

  return extractImportableCustomAttributes(typeDef, translations)
    .filter((attr) => subTypeAttributeKeys.value.has(attr.key))
    .map((attr) => ({
      ...attr,
      allowedValues: attr.allowedValues?.map((value) => translations[value] || value)
    }));
});

async function exportToCSV(subType: string) {
  try {
    selectedSubtypeForCreateDialog.value = subType;
    await until(selectedFormSchema).not.toBeUndefined();
    const standardFields = [
      {
        title: `${t('objectlist.name')} (${t('global.input.requiredfields')})`,
        type: 'text'
      },
      {
        title: t('objectlist.abbreviation'),
        type: 'text'
      },
      {
        title: t('objectlist.description'),
        type: 'text'
      }
    ];
    const fields = [...standardFields, ...customAttributes.value];
    const headerRow = fields.map((f) => escapeCSV(`${f.title}_(${f.type})`)).join(';');
    const dataRows = buildRows(fields, t);

    const csvContent = [headerRow, ...dataRows.map((r) => r.join(';'))].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const subtypeLabel =
      currentDomain.value.raw.elementTypeDefinitions[objectType].translations[locale.value][
        `${objectType}_${subType}_singular`
      ];

    link.download = `${objectType}_${subtypeLabel}.csv`;
    link.click();

    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error during  Csv file download', error);
  }
}
</script>
<style scoped lang="scss"></style>
<i18n src="~/locales/base/components/object-csv-import-card.json"></i18n>
