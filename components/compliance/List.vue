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
      :items="translatedRequirementImplementations"
      item-key="id"
      :additional-headers="headers"
      enable-click
      @click="
        (e) =>
          openItem({
            type: state.type.value,
            riskAffected: state.riskAffected.value,
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

    <ComplianceEditor
      :item="requirementImplementation"
      :show-dialog="showDialog"
      @update:show-dialog="showDialog = !showDialog"
      @update:item="reloadRequirementImplementations"
    />
  </BaseCard>
</template>
<script lang="ts">
function translate(requirementImplementations, t) {
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

const { fetchRequirementImplementations, fetchRequirementImplementation, state } = useCompliance();

const { t, locale } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

interface Emits {
  (e: 'update:currentName', currentName: string): void;
  (e: 'update:currentModule', currentModule: string): void;
}
const emit = defineEmits<Emits>();

const fetchParams = computed(() => ({
  type: state.type.value as string,
  riskAffected: state.riskAffected.value as string,
  control: state.control.value as string
}));

const requirementImplementations = ref<any>();

requirementImplementations.value = await fetchRequirementImplementations({
  ...fetchParams.value
});
watch(
  fetchParams,
  async () =>
    (requirementImplementations.value = await fetchRequirementImplementations({
      ...fetchParams.value
    }))
);

// Translate
const translatedRequirementImplementations = ref(translate(requirementImplementations.value, globalT));

watch(requirementImplementations, () => {
  translatedRequirementImplementations.value = translate(requirementImplementations.value, globalT);
});

watch(locale, () => {
  translatedRequirementImplementations.value = translate(requirementImplementations.value, globalT);
});

const currentName = computed(() => requirementImplementations?.value?.items?.[0]?.origin?.displayName);
const currentModule = computed(() => requirementImplementations?.value?.items?.[0]?.control?.abbreviation);
watch([currentName, currentModule], ([newName, newModule]) => {
  emit('update:currentName', newName);
  emit('update:currentModule', newModule);
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
  requirementImplementations.value = await fetchRequirementImplementations({
    type: state.type.value as string,
    riskAffected: state.riskAffected.value as string,
    control: state.control.value as string
  });
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
    sortable: true,
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
