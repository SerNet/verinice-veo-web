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
      :items="translatedRequirementImplementations"
      item-key="id"
      :additional-headers="headers"
      enable-click
      @click="
        (e) =>
          openItem({
            type: state.type.value,
            riskAffected: state.CTLModule.value.owner?.id,
            item: e.item
          })
      "
    >
      <template #no-data>
        <span class="text-center">
          {{ t('noRequirementImplementations') }}
        </span>
      </template>
    </BaseTable>

    <!-- @vue-ignore TODO #3066 domainId is missing??? -->
    <ComplianceEditor
      :item="requirementImplementation"
      :show-dialog="showDialog"
      :locale="locale"
      @update:show-dialog="showDialog = !showDialog"
      @update:item="reloadRequirementImplementations"
    />
  </BaseCard>
</template>
<script lang="ts">
function translate(requirementImplementations: { items: any[] }, t: any) {
  if (!requirementImplementations) return;
  return requirementImplementations.items.map((item) => {
    const status = t(`compliance.status.${item.status}`);
    const origination = t(`compliance.origination.${item.origination}`);
    return { ...item, translations: { status, origination } };
  });
}
</script>

<script setup lang="ts">
import { TableHeader } from '../base/Table.vue';
import { useCompliance } from './compliance';
import { RequirementImplementation } from './Editor.vue';

const { tablePageSize } = useVeoUser();

const { fetchRequirementImplementations, fetchRequirementImplementation, state } = useCompliance();

const sortBy = ref([{ key: 'control.abbreviation', order: 'asc' }]);
const { t, locale } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

function mapSortingKey(key: string) {
  switch (key) {
    case 'translations.origination':
      return 'origination';
    case 'translations.status':
      return 'status';
    default:
      return key;
  }
}

const fetchParams = computed(() => {
  if (!state.CTLModule.value) return undefined;
  return {
    type: state.type.value as string,
    riskAffected: state.CTLModule.value.owner.id as string,
    control: state.CTLModule.value.id,
    sortBy: mapSortingKey(sortBy.value[0].key),
    sortOrder: sortBy.value[0].order,
    size: tablePageSize.value
  };
});

const requirementImplementations = ref<any>();
requirementImplementations.value =
  fetchParams.value ?
    await fetchRequirementImplementations({
      ...fetchParams.value
    })
  : undefined;

watch(fetchParams, async () => {
  if (!fetchParams.value) return;
  requirementImplementations.value = await fetchRequirementImplementations({
    ...fetchParams.value
  });
});

// Translate
const translatedRequirementImplementations = ref(translate(requirementImplementations.value, globalT));

watch(requirementImplementations, () => {
  translatedRequirementImplementations.value = translate(requirementImplementations.value, globalT);
});

watch(locale, () => {
  translatedRequirementImplementations.value = translate(requirementImplementations.value, globalT);
});

// Open a single RI
const requirementImplementation: Ref<RequirementImplementation | null> = ref(null);
const showDialog = ref(false);

async function openItem({ type, riskAffected, item }: { type: string | null; riskAffected: string | null; item: any }) {
  if (!type || !riskAffected) return;

  showDialog.value = true;

  requirementImplementation.value = await fetchRequirementImplementation({
    type: type as string,
    riskAffected: riskAffected as string,
    item
  });
}

const reloadRequirementImplementations = async () => {
  if (!fetchParams.value) return;
  requirementImplementations.value = await fetchRequirementImplementations(fetchParams.value);
};

// Table setup
const headers: ComputedRef<TableHeader[]> = computed(() => [
  {
    text: t('thAbbreviation'),
    key: 'control.abbreviation',
    sortable: true,
    priority: 60,
    order: 30
  },
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

<i18n>
{
"de": {
  "thAbbreviation": "Abkürzung",
  "thName": "Anforderung",
  "thOrigin": "Umsetzungsherkunft",
  "thResponsibleBody": "Verantwortlich",
  "thStatus": "Status",
  "noRequirementImplementations": "Keine Requirement Implementations vorhanden."
},
"en": {
  "thAbbreviation": "Abbreviation",
  "thName": "Requirement",
  "thOrigin": "Origin",
  "thResponsibleBody": "Responsible",
  "thStatus": "Status",
  "noRequirementImplementations": "No requirement implementations available."
}
}
</i18n>

<style>
/* Do not show a checkbox in table header */
#profileStyleScope th .v-selection-control__wrapper {
  display: none;
}
</style>
