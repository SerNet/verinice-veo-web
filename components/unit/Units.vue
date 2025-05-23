<!--
verinice.veo web
Copyright (C) 2024 jae

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <v-row align="center" class="flex overflow-auto" justify="center">
    <template v-if="isLoadingUnits">
      <v-col cols="12">
        <VSkeletonLoader v-for="i in 5" :key="i" type="image" elevation="2" class="my-6" height="160px" />
      </v-col>
    </template>

    <template v-if="units && !isLoadingUnits">
      <BaseListItem v-for="unit in units" :key="unit.id" class="parent" :item="unit">
        <template #details="{ item: u }">
          <Details
            :name="u.name"
            :description="u.description"
            :meta="compileMetaData({ metaData: u.metaData, unitId: u.id })"
          />
        </template>
        <template #center-aside="{ item: u }">
          <UnitActions :details-url="u?.detailsUrl" @delete-unit="() => deleteUnit(u)" />
        </template>
        <template #bottom-left="{ item: u }">
          <DomainActions :domains="u.domains" :domains-url="u.domainsUrl" />
        </template>
        <template #prepend="{ item: u }">
          <BookmarkFavorite :is-favorite="u?.isFavorite" @bookmark-favorite="() => bookmarkFavoriteUnit(u)" />
        </template>
        <template #bottom-right="{ item: u }">
          <ApplyProfiles :profiles-url="u?.profilesUrl" />
        </template>
      </BaseListItem>
    </template>
  </v-row>

  <UnitDeleteDialog v-model="deleteDialogIsOpen" :unit="unitToDelete" />
</template>

<script setup lang="ts">
import {
  mdiBookmark,
  mdiBookmarkOutline,
  mdiDeleteOutline,
  mdiPencilOutline,
  mdiPlus,
  mdiPuzzle,
  mdiShapeOutline
} from '@mdi/js';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

// Types
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import type { TVeoUnit } from '~/composables/units/useUnits';
import type { TInlineComponent } from '~/types/utils';

const { t } = useI18n();

// Unit Data
const { data: veoUnits, isLoading: isLoadingUnits, invalidateUnitCache } = useUnits();
const activeUnits = computed(() => veoUnits.value?.length || null);
const newUnits = ref<any>(null);

// Sort helper: show last updated unit on top
function sortUnits(a: TVeoUnit, b: TVeoUnit): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

const units = computed({
  get() {
    if (newUnits.value) return newUnits.value;
    return veoUnits.value?.sort(sortUnits) ?? [];
  },
  set(newValue) {
    newUnits.value = newValue;
  }
});

// Unit Actions
const unitToEditId = ref<undefined | string>(undefined);
const unitToDelete = ref<undefined | IVeoUnit>(undefined);
const isManageDialogOpen = ref(false);
const deleteDialogIsOpen = ref(false);

function createUnit() {
  unitToEditId.value = undefined;
  isManageDialogOpen.value = true;
}

function _editUnit(unit: TVeoUnit) {
  unitToEditId.value = unit.id;
  isManageDialogOpen.value = true;
}

function deleteUnit(unit: TVeoUnit) {
  unitToDelete.value = unit.raw;
  deleteDialogIsOpen.value = true;
}

function bookmarkFavoriteUnit(unit: TVeoUnit) {
  if (!units.value) return;
  const favoriteUnitDomainId = unit.domains[0]?.id;
  localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT, unit.id);

  if (typeof favoriteUnitDomainId === 'string') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT_DOMAIN, favoriteUnitDomainId);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT_DOMAIN);
  }
  // Change the units' isFavorite state
  units.value = units.value.map((u: TVeoUnit) => ({ ...u, isFavorite: u.id === unit.id }));
  invalidateUnitCache();
}

function compileMetaData({ metaData, unitId }) {
  return `${t('createdBy')}: ${metaData.createdBy} | ${t('createdAt')}: ${metaData.createdAt} | ID: ${unitId}`;
}

defineExpose({
  createUnit,
  activeUnits
});

/* ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++ COMPONENTS ++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ */

const Details: TInlineComponent = {
  props: ['name', 'description', 'meta'],
  data: () => ({ t }),
  template: `
    <v-card-title v-text="name"></v-card-title>
    <v-card-subtitle v-text="this.meta"></v-card-subtitle>
    <v-card-text
      data-veo-test="item-card-text"
      v-text="this.description || t('noDescription')">
    </v-card-text>
  `
};

const UnitActions: TInlineComponent = {
  props: ['detailsUrl'],
  data: () => ({ mdiPencilOutline, mdiDeleteOutline, t }),
  emits: ['deleteUnit'],
  methods: {
    emitDeleteUnit() {
      (this as any).$emit('deleteUnit');
    }
  },
  template: `
    <v-tooltip :text="t('editUnit')" :aria-label="t('editUnit')">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :to="detailsUrl"
          :icon="mdiPencilOutline"
          variant="text"
          :aria-label="t('editUnit')"
          data-veo-test="units-edit-unit-button"
          data-component-name="units-edit-unit-button"
        >
        </v-btn>
      </template>
    </v-tooltip>
    <v-tooltip :text="t('deleteUnit')" :aria-label="t('deleteUnit')">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          @click="emitDeleteUnit"
          :icon="mdiDeleteOutline"
          variant="text"
          :aria-label="t('deleteUnit')"
          data-veo-test="units-delete-unit-button"
          data-component-name="units-delete-unit-button"
        >
        </v-btn>
      </template>
    </v-tooltip>
  `
};

const DomainActions: TInlineComponent = {
  props: ['domains', 'domainsUrl'],
  data: () => ({ mdiPuzzle, mdiPlus, t, useDomainColor }),
  template: `
    <v-chip v-for="(domain, index) in this.domains"
      label
      :key="index"
      :prepend-icon="mdiPuzzle"
      variant="outlined"
      :color="useDomainColor(domain.name)"
      class="domain-btn"
      size="x-small"
    >
      {{ domain.name }}
    </v-chip>

    <v-tooltip :text="t('editDomains')" :aria-label="t('editDomains')">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        data-veo-test="units-add-domains-button"
        data-component-name="units-add-domains-button"
        :to="domainsUrl"
        :prepend-icon="mdiPlus"
        variant="text"
        size="x-small"
      >
      {{ t('editDomains') }}
    </v-btn>
    </template>
    </v-tooltip>
  `
};

const BookmarkFavorite: TInlineComponent = {
  props: ['isFavorite'],
  emits: ['bookmarkFavorite'],
  data: () => ({ mdiBookmark, mdiBookmarkOutline, t }),
  methods: {
    emitBookmark() {
      (this as any).$emit('bookmarkFavorite');
    }
  },
  template: `
    <v-tooltip :text="t('bookmarkTooltip')" :aria-label="t('bookmarkTooltip')">
      <template #activator={props}>
        <v-btn
          data-component-name="unit-favorite-button"
          v-bind="props"
          :icon="this.isFavorite ? mdiBookmark : mdiBookmarkOutline"
          variant="text"
          :aria-label="t('bookmarkTooltip')"
          @click="emitBookmark"
        />
      </template>
    </v-tooltip>
  `
};

const ApplyProfiles: TInlineComponent = {
  props: ['profilesUrl'],
  data: () => ({ mdiShapeOutline, t }),

  template: `
    <v-tooltip :text="t('addProfiles')" :aria-label="t('addProfiles')">
      <template #activator={props}>
        <v-btn
          v-bind="props"
          :to="this.profilesUrl"
          :prepend-icon="mdiShapeOutline"
          data-veo-test="apply-profiles-link"
          data-component-name="apply-profiles-link"
          variant="outlined"
          color="primary"
          size="small"
        >
        {{ t('addProfiles') }}
        </v-btn>
      </template>
    </v-tooltip>
    `
};
</script>

<i18n src="~/locales/base/components/unit-units.json"></i18n>

<style scoped lang="scss">
:deep(.domain-btn) {
  cursor: default;
}
.parent * {
  overflow-wrap: anywhere;
}
</style>
