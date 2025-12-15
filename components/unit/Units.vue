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
          <UnitActions
            :details-url="u?.detailsUrl"
            :can-update-unit="canUpdateUnit"
            :can-delete-unit="canDeleteUnit"
            @delete-unit="() => deleteUnit(u)"
          />
        </template>
        <template #bottom-left="{ item: u }">
          <DomainActions :domains="u.domains" :domains-url="u.domainsUrl" :can-update-unit="canUpdateUnit" />
        </template>
        <template #prepend="{ item: u }">
          <BookmarkFavorite :is-favorite="u?.isFavorite" @bookmark-favorite="() => bookmarkFavoriteUnit(u)" />
        </template>
        <template #bottom-right="{ item: u }">
          <ApplyProfiles :profiles-url="u?.profilesUrl" :can-update-unit="canUpdateUnit" />
        </template>
      </BaseListItem>
    </template>

    <template v-if="!units || units.length === 0">
      <div class="py-16 text-center w-50">
        <h3 class="text-h3">
          {{ !ability.can('create', 'unit') ? t('cannotCreateUnitHint') : t('noUnitsText') }}
        </h3>
        <div class="mt-4">
          <v-tooltip location="bottom" :aria-label="t('createUnit')">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                data-veo-test="create-unit-btn"
                :disabled="!ability.can('create', 'unit')"
                data-component-name="create-unit-btn"
                to="/units/create"
                :prepend-icon="mdiPlus"
                color="primary"
                size="large"
                :aria-label="t('createUnit')"
                class="mr-4"
              >
                {{ t('createUnit') }}
              </v-btn>
            </template>
            <template #default>
              <span>
                {{ t('createUnitHint') }}
              </span>
            </template>
          </v-tooltip>

          <v-tooltip location="bottom" :aria-label="t('firstStep')">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                data-veo-test="first-step-btn"
                data-component-name="first-step-btn"
                :prepend-icon="mdiFootPrint"
                to="/welcome"
                color="gray"
                size="large"
                :aria-label="t('firstStep')"
              >
                {{ t('firstStep') }}
              </v-btn>
            </template>
            <template #default>
              <span>
                {{ t('firstStepHint') }}
              </span>
            </template>
          </v-tooltip>
        </div>
      </div>
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
  mdiShapeOutline,
  mdiFootPrint
} from '@mdi/js';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { sortUnits, type TVeoUnit } from '~/composables/requests/useUnits';
import { useVeoPermissions } from '~/composables/VeoPermissions';

import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import type { TInlineComponent } from '~/types/utils';

const { t, locale } = useI18n();

// Unit Data
const { data: veoUnits, isLoading: isLoadingUnits, refetch: refetchUnits } = useUnits();
const activeUnits = computed(() => veoUnits.value?.length || null);
const newUnits = ref<any>(null);
const { data: allDomains } = useDomains();

const { ability } = useVeoPermissions();
const canUpdateUnit = computed(() => ability.value.can('update', 'unit'));
const canDeleteUnit = computed(() => ability.value.can('delete', 'unit'));

const units = computed({
  get() {
    if (newUnits.value) return newUnits.value;
    // 'vue/no-side-effects-in-computed-properties'
    // eslint-disable-next-line
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
  refetchUnits();
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
  props: ['detailsUrl', 'canUpdateUnit', 'canDeleteUnit'],
  data: () => ({ mdiPencilOutline, mdiDeleteOutline, t }),
  emits: ['deleteUnit'],
  methods: {
    emitDeleteUnit() {
      (this as any).$emit('deleteUnit');
    }
  },
  template: `
    <!-- EDIT BUTTON -->
    <v-tooltip :aria-label="t('editUnit')">
      <template #activator="{ props }">
        <span v-bind="props">
          <v-btn
            v-if="canUpdateUnit"
            :to="detailsUrl"
            :icon="mdiPencilOutline"
            variant="text"
            :aria-label="t('editUnit')"
            data-veo-test="units-edit-unit-button"
            data-component-name="units-edit-unit-button"
          />
          <v-btn
            v-else
            disabled
            :icon="mdiPencilOutline"
            variant="text"
          />
        </span>
      </template>
      <template #default>
        <span v-if="!canUpdateUnit">
          {{ t('permissions.missingPermissionTooltip') }}
        </span>
        <span v-else>
          {{ t('editUnit') }}
        </span>
      </template>
    </v-tooltip>

    <!-- DELETE BUTTON -->
    <v-tooltip :aria-label="t('deleteUnit')">
      <template #activator="{ props }">
        <span v-bind="props">
          <v-btn
            v-if="canDeleteUnit"
            @click="emitDeleteUnit"
            :icon="mdiDeleteOutline"
            variant="text"
            :aria-label="t('deleteUnit')"
            data-veo-test="units-delete-unit-button"
            data-component-name="units-delete-unit-button"
          />
          <v-btn
            v-else
            disabled
            :icon="mdiDeleteOutline"
            variant="text"
          />
        </span>
      </template>
      <template #default>
        <span v-if="!canDeleteUnit">
          {{ t('permissions.missingPermissionTooltip') }}
        </span>
        <span v-else>
          {{ t('deleteUnit') }}
        </span>
      </template>
    </v-tooltip>
  `
};

const DomainActions: TInlineComponent = {
  props: ['domains', 'domainsUrl', 'canUpdateUnit'],
  data: () => ({ mdiPuzzle, mdiPlus, t, useDomainColor, allDomains, locale }),

  methods: {
    getDomainLabel(domain) {
      const raw = (this.allDomains as any)?.find((d: any) => d.id === domain?.id);
      return raw?.translations?.[(this as any).locale]?.name || domain?.name || '';
    }
  },
  template: `
    <!-- Display domain chips -->
    <v-chip
      v-for="(domain, index) in domains"
      :key="index"
      label
      :prepend-icon="mdiPuzzle"
      variant="outlined"
      :color="useDomainColor(domain.name)"
      class="domain-btn"
      size="x-small"
      :data-veo-test="'domain-card-chip-' + (domain?.name).toLowerCase()"
    >
      {{ getDomainLabel(domain) }}
    </v-chip>

    <!-- Edit/Add Domains button with tooltip -->
    <v-tooltip :aria-label="t('editDomains')">
      <template #activator="{ props }">
        <span v-bind="props">
          <v-btn
            :disabled="!canUpdateUnit"
            :to="domainsUrl"
            :prepend-icon="mdiPlus"
            variant="text"
            size="x-small"
            data-veo-test="units-add-domains-button"
            data-component-name="units-add-domains-button"
          >
            {{ t('editDomains') }}
          </v-btn>
        </span>
      </template>

      <template #default>
        <span v-if="!canUpdateUnit">
          {{ t('permissions.missingPermissionTooltip') }}
        </span>
        <span v-else>
          {{ t('editDomains') }}
        </span>
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
  props: ['profilesUrl', 'unit', 'canUpdateUnit'],
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
          :disabled="!canUpdateUnit"
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
