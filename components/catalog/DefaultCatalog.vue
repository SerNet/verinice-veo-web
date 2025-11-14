<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div>
    <p class="text-body-1">
      <slot name="header" />
    </p>
    <BaseCard>
      <BaseTable
        v-model="selectedItems"
        v-model:page="page"
        v-model:sort-by="sortBy"
        :items="catalogItems"
        :additional-headers="headers"
        :loading="props.isLoading"
        show-select
      />
    </BaseCard>
    <v-row dense class="my-4">
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          variant="text"
          class="mr-2"
          :disabled="selectedItems.length === 0 || isApplyingItems"
          @click="selectedItems = []"
        >
          {{ globalT('global.button.cancel') }}
        </v-btn>
        <v-tooltip location="start" :aria-label="t('apply')">
          <template #activator="{ props }">
            <span v-bind="props">
              <v-btn
                data-veo-test="catalogs-btn-apply"
                flat
                color="primary"
                :disabled="selectedItems.length === 0 || isApplyingItems || !canManageUnitContent"
                :loading="props.isApplyingItems"
                @click="$emit('applyItems')"
              >
                {{ t('apply') }}
              </v-btn>
            </span>
          </template>
          <template #default>
            <span v-if="!canManageUnitContent">
              {{ t('permissions.missingPermissionTooltip') }}
            </span>
            <span v-else>
              {{ t('apply') }}
            </span>
          </template>
        </v-tooltip>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { SortItem } from '~/components/base/Table.vue';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import type { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';
import type { TableHeader } from '../base/Table.vue';

const props = withDefaults(
  defineProps<{
    catalogItems: IVeoPaginatedResponse<IVeoEntity[]> | undefined;
    modelValue: IVeoEntity[] | [];
    isLoading?: boolean;
    isApplyingItems?: boolean;
  }>(),
  {
    modelValue: () => [],
    loading: false,
    isLoading: false,
    isApplyingItems: false
  }
);

interface Emits {
  (e: 'update:modelValue', selectedItems: IVeoEntity[]): void;
  (e: 'applyItems'): void;
}
const emit = defineEmits<Emits>();

const { t, locale } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { ability, subject } = useVeoPermissions();
const { data: currentDomain } = useCurrentDomain();
const route = useRoute();
const { data: translations } = useTranslations({ domain: route.params.domain as string });

const elementType = computed(() => {
  // Since all catalog items are of the same type, we can just use the first one
  const firstItem = props.catalogItems.items?.[0];
  return firstItem?.elementType ?? null;
});

const headers = computed<TableHeader[]>(() => [
  {
    value: 'abbreviation',
    key: 'abbreviation',
    sortable: true,
    truncate: true,
    width: 80,
    priority: 60,
    order: 30
  },
  {
    value: 'name',
    key: 'name',
    cellClass: ['font-weight-bold'],
    width: 600,
    truncate: true,
    sortable: true,
    priority: 100,
    order: 40
  },
  {
    value: 'description',
    key: 'description',
    sortable: false,
    width: 500,
    truncate: true,
    tooltip: ({ internalItem: item }: { internalItem: any }) => item.raw.description,
    priority: 30,
    order: 60
  },
  ...((
    elementType.value &&
    currentDomain.value?.raw?.elementTypeDefinitions?.[elementType.value]?.customAspects?.control_bpInformation
  ) ?
    [
      {
        priority: 100,
        order: 31,
        key: `customAspects.control_bpInformation.control_bpInformation_protectionApproach`,
        value: `customAspects.control_bpInformation.control_bpInformation_protectionApproach`,
        render: ({ item }: any) => {
          return h(
            'div',
            translations.value?.lang?.[locale.value]?.[
              item.customAspects?.control_bpInformation?.control_bpInformation_protectionApproach
            ] ?? ''
          );
        },
        text: t('VdA').toString(),
        sortable: false,
        width: 80
      }
    ]
  : [])
]);

const page = defineModel<number>('page', { default: 0 });
const sortBy = defineModel<SortItem[]>('sortBy', {
  default: [{ key: 'abbreviation', order: 'asc' }]
});

const selectedItems = computed({
  get() {
    return props.modelValue;
  },
  set(selectedItems) {
    emit('update:modelValue', selectedItems);
  }
});

const availableItems = computed(() =>
  props.catalogItems?.items?.map((item) => {
    const { abbreviation, name, id, description = '' } = item;
    return { abbreviation, name, id, description };
  })
);

// If the available items change (they shouldn't) only select the items that are still available.
watch(
  () => availableItems.value,
  (newValue) => {
    const newValues = selectedItems.value.filter((selectedItem) =>
      newValue?.some((item) => item.id === selectedItem.id)
    );
    selectedItems.value = newValues;
  }
);

const canManageUnitContent = computed(() =>
  ability.value.can('manage', subject('units', { id: route.params.unit as string }))
);
</script>

<i18n src="~/locales/base/components/catalog-default-catalog.json"></i18n>
