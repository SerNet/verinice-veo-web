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
  <BaseCard class="mb-8">
    <BaseTable
      v-model:sort-by="sortBy"
      v-model:page="page"
      :items="isLoading ? [] : translatedRequirementImplementations"
      :loading="isLoading"
      item-key="id"
      :additional-headers="headers"
      enable-click
      @click="
        (e) =>
          openItem({
            type: VeoElementTypePlurals[route.query.type as keyof typeof VeoElementTypePlurals],
            targetObject: route.query.targetObject as string,
            item: e.item
          })
      "
    >
      <template #no-data>
        <span class="text-center">{{ t('noRequirementImplementations') }}</span>
      </template>
    </BaseTable>

    <!-- @vue-ignore TODO #3066 domainId is missing??? -->
    <ComplianceEditor
      :v-if="showDialog"
      :item="requirementImplementation"
      :show-dialog="showDialog"
      :locale="locale"
      @update:show-dialog="showDialog = !showDialog"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { useRequirementImplementationQuery } from '~/composables/requirementImplementation';
import { useRequirementImplementationList } from '~/composables/requirementImplementations';
import { IVeoEntity, VeoElementTypePlurals } from '~/types/VeoTypes';
import { TableHeader } from '../base/Table.vue';

const props = defineProps<{
  containerControl: Partial<IVeoEntity> | undefined;
}>();

const route = useRoute();
const { t, locale } = useI18n();
const { data: currentDomain } = useCurrentDomain();
const { data: translations } = useTranslations({ domain: route.params.domain as string });

// Fetch RIs
const { sortBy, page, translatedRequirementImplementations, isLoading, _refetch } = useRequirementImplementationList();
// Open a single RI
const { showDialog, requirementImplementation, openItem } = useRequirementImplementationQuery();
// Table setup
const showVdA = ref(false);

watch(
  [() => currentDomain.value, () => route.query.type, () => props.containerControl?.subType],
  () => {
    const controlConfig = currentDomain.value?.raw?.controlImplementationConfiguration;
    const bpInformation =
      currentDomain.value?.raw?.elementTypeDefinitions?.control?.customAspects?.control_bpInformation;

    const subTypeMatches =
      props.containerControl?.subType === controlConfig?.complianceControlSubType ||
      props.containerControl?.subType === controlConfig?.mitigationControlSubType;

    showVdA.value = bpInformation && subTypeMatches;
  },
  { immediate: true }
);

const headers: ComputedRef<TableHeader[]> = computed(() => [
  {
    text: t('thAbbreviation'),
    key: 'control.abbreviation',
    sortable: true,
    priority: 60,
    order: 30
  },
  ...(showVdA.value ?
    [
      {
        priority: 60,
        order: 30,
        key: `control.customAspects.control_bpInformation.control_bpInformation_protectionApproach`,
        value: `control.customAspects.control_bpInformation.control_bpInformation_protectionApproach`,
        render: ({ item }: any) => {
          return h(
            'div',
            translations.value?.lang?.[locale.value]?.[
              item.control?.customAspects?.control_bpInformation?.control_bpInformation_protectionApproach
            ] ?? ''
          );
        },
        text: t('VdA').toString(),
        sortable: false,
        width: 80
      }
    ]
  : []),
  {
    text: t('thName'),
    key: 'control.name',
    cellClass: ['font-weight-bold'],
    sortable: true,
    priority: 60,
    order: 30
  },
  {
    text: t('thResponsibleBody'),
    key: 'responsible.displayName',
    sortable: false,
    priority: 60,
    order: 30
  },
  {
    text: t('thStatus'),
    key: 'translations.status',
    sortable: true,
    priority: 60,
    order: 30
  },
  {
    text: t('thOrigin'),
    key: 'translations.origination',
    sortable: true,
    priority: 80,
    order: 30
  }
]);
</script>

<i18n src="~/locales/base/components/compliance-list.json"></i18n>

<style>
/* Do not show a checkbox in table header */
#profileStyleScope th .v-selection-control__wrapper {
  display: none;
}
</style>
