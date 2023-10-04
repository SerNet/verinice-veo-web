<template>
  <BaseCard class="mb-8">
    <BaseTable
      :items="requirementImplementations.items"
      item-key="id"
      :additional-headers="headers"
      enable-click
      @click="(e) => openItem({
        type: state.type.value,
        riskAffected: state.riskAffected.value,
        item: e.item
      })"
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

<script setup lang="ts">
import { TableHeader } from '../base/Table.vue';
import { useCompliance } from './compliance';

const {
  fetchRequirementImplementations,
  fetchRequirementImplementation,
  state
} = useCompliance();

const { t } = useI18n();

interface Emits {
  (e: 'update:currentName', currentName: string): void
}
const emit = defineEmits<Emits>()


const requirementImplementations =
  ref(await fetchRequirementImplementations({
    type: state.type.value as string,
    riskAffected: state.riskAffected.value as string,
    control: state.control.value as string
  }));

const currentName = computed(() => requirementImplementations?.value?.items?.[0]?.origin?.displayName);

// Emit the current name
emit('update:currentName', currentName.value);
watch(currentName, () => emit('update:currentName', currentName.value));

// Open a single RI
const requirementImplementation = ref(null);
const showDialog = ref(false);

async function openItem({ type, riskAffected, item }:
{ type: string | null, riskAffected: string | null, item: any }) {
  if(!type || !riskAffected) return;

  showDialog.value = true;

  requirementImplementation.value =
    await fetchRequirementImplementation({
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
const headers: ComputedRef<TableHeader[]> = computed(()=> [
{
    text: t('thName'),
    key: 'control.displayName',
    cellClass: ['font-weight-bold'],
    sortable: true,
    priority: 60,
    order: 30
  },
  {
    text: t('thOrigin'),
    key: 'origination',
    sortable: true,
    priority: 80,
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
    key: 'status',
    sortable: true,
    priority: 60,
    order: 30
  }
]);
</script>

<i18n>
{
"en": {
  "hint": "Lorem ipsum dolor sit amet.",
  "thAbbreviation": "Abkürzung",
  "thName": "Anforderung",
  "thOrigin": "Umsetzungsherkunft",
  "thResponsibleBody": "Verantwortlich",
  "thStatus": "Status",
  "noRequirementImplementations": "Keine Requirement Implementations vorhanden."
},
"de": {
  "hint": "Lorem ipsum dolor sit amet.",
  "thAbbreviation": "Abkürzung",
  "thName": "Anforderung",
  "thOrigin": "Umsetzungsherkunft",
  "thResponsibleBody": "Verantwortlich",
  "thStatus": "Status",
  "noRequirementImplementations": "Keine Requirement Implementations vorhanden."
}
}
</i18n>

<style>
/* Do not show a checkbox in table header */
#profileStyleScope th .v-selection-control__wrapper {
  display: none;
}
</style>
