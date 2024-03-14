<template>
  <v-row align="center" justify="center">
    <template v-if="isFetchingUnits" class="mb-4">
      <v-col cols="12">
        <VSkeletonLoader v-for="i in 5" :key="i" type="image" elevation="2" class="my-6" height="160px" />
      </v-col>
    </template>

    <template v-if="units && !isFetchingUnits" v-for="unit in units">
      <BaseListItem :item="unit">
        <template #center-aside="{ item: unit }">
          <UnitActions @edit-unit="() => editUnit(unit)" @delete-unit="() => deleteUnit(unit)" />
        </template>
        <template #bottom-left="{ item: unit }">
          <DomainActions :domains="unit.domains" @edit-domains="() => editDomains(unit)" />
        </template>
        <template #prepend="{ item: unit }">
          <BookmarkFavorite :isFavorite="unit?.isFavorite" @bookmark-favorite="() => bookmarkFavoriteUnit(unit)" />
        </template>
        <template #bottom-right="{ item: unit }">
          <ApplyProfiles :profilesUrl="unit?.profilesUrl" />
        </template>
      </BaseListItem>
    </template>
  </v-row>

  <UnitManageDialog v-model="isManageDialogOpen" :unit-id="unitToEditId" />
  <UnitDeleteDialog v-model="deleteDialogIsOpen" :unit="unitToDelete" />
</template>

<script setup lang="ts">
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { useQuery } from '~/composables/api/utils/query';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import {
  mdiPencilOutline,
  mdiPuzzle,
  mdiBookmark,
  mdiBookmarkOutline,
  mdiDeleteOutline,
  mdiShapeOutline
} from '@mdi/js';
import { format } from 'date-fns';
import { mapUnitValues } from './unit-module';

// Locally used types
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import type { TUnit } from './unit-module.ts';

type TInlineComponent = {
  props?: string[];
  emits?: string[];
  data?: () => Record<string, string>;
  methods?: Record<string, () => void | any>;
  template?: string;
};

const { data: _units, isFetching: isFetchingUnits } = useQuery(unitQueryDefinitions.queries.fetchAll);
const activeUnits = computed(() => _units.value?.length || null);
const favoriteUnitId: string | null = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT);

const newUnits = ref<any>(null);
const units = computed({
  get() {
    if (newUnits.value) return newUnits.value;
    if (!_units.value) return [];

    return _units.value.map((unit: IVeoUnit) => mapUnitValues({ unit, favoriteUnitId }));
  },
  set(newValue) {
    newUnits.value = newValue;
  }
});

// Unit Actions
const unitToEditId = ref<null | string>(null);
const unitToDelete = ref<null | IVeoUnit>(null);
const isManageDialogOpen = ref(false);
const deleteDialogIsOpen = ref(false);

function createUnit() {
  unitToEditId.value = null;
  isManageDialogOpen.value = true;
}

function editUnit(unit: TUnit) {
  unitToEditId.value = unit.id;
  isManageDialogOpen.value = true;
}

function deleteUnit(unit: TUnit) {
  unitToDelete.value = unit.raw;
  deleteDialogIsOpen.value = true;
}

function bookmarkFavoriteUnit(unit: TUnit) {
  if (!units.value) return;
  const favoriteUnitDomainId = unit.raw.domains[0]?.id;

  localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT, unit.id);

  if (typeof favoriteUnitDomainId === 'string') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT_DOMAIN, favoriteUnitDomainId);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT_DOMAIN);
  }

  // Change the units' isFavorite state
  units.value = units.value.map((u: TUnit) => ({ ...u, isFavorite: u.id === unit.id }));
}

// Domain Actions
function editDomains(unit: TUnit) {
  // For now the same action as in `editUnit` is triggered
  // In a later iteration this is going to change
  editUnit(unit);
}

defineExpose({
  createUnit,
  activeUnits
});

/* ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++ COMPONENTS ++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ */

const UnitActions: TInlineComponent = {
  data: () => ({ mdiPencilOutline, mdiDeleteOutline }),
  emits: ['editUnit', 'deleteUnit'],
  methods: {
    emitEditUnit() {
      (this as any).$emit('editUnit');
    },
    emitDeleteUnit() {
      (this as any).$emit('deleteUnit');
    }
  },
  template: `
    <v-btn
      @click="emitEditUnit"
      :icon="mdiPencilOutline"
      variant="text"
      data-veo-test="units-edit-unit-button"
    >
    </v-btn>
    <v-btn
      @click="emitDeleteUnit"
      :icon="mdiDeleteOutline"
      variant="text"
      data-veo-test="units-delete-unit-button"
    >
    </v-btn>
  `
};

const DomainActions: TInlineComponent = {
  props: ['domains'],
  emits: ['editDomains'],
  data: () => ({ mdiPuzzle, mdiPencilOutline }),
  methods: {
    emitEditDomains() {
      (this as any).$emit('editDomains');
    }
  },
  template: `
    <v-btn v-for="(domain, index) in this.domains"
      :key="index"
      :prepend-icon="mdiPuzzle"
      variant="outlined"
      :color="domain.color"
      size="x-small"
    >
      {{ domain.name }}
    </v-btn>

    <v-btn
      :prepend-icon="mdiPencilOutline"
      variant="text"
      size="x-small"
      @click="emitEditDomains"
    >
      Edit domains
    </v-btn>
  `
};

const BookmarkFavorite: TInlineComponent = {
  props: ['isFavorite'],
  emits: ['bookmarkFavorite'],
  data: () => ({ mdiBookmark, mdiBookmarkOutline }),
  methods: {
    emitBookmark() {
      (this as any).$emit('bookmarkFavorite');
    }
  },
  template: `
    <v-btn
      :icon="this.isFavorite ? mdiBookmark : mdiBookmarkOutline"
      variant="text"
      @click="emitBookmark"
    />
  `
};

const ApplyProfiles: TInlineComponent = {
  props: ['profilesUrl'],
  emits: ['apply-profiles'],
  data: () => ({ mdiShapeOutline }),
  methods: {
    emitApplyProfiles() {
      (this as any).$emit('apply-profiles');
    }
  },
  template: `
    <v-btn
      :href="this.profilesUrl"
      :prepend-icon="mdiShapeOutline"
      data-veo-test="apply-profiles-link"
      variant="outlined"
      color="primary"
      size="small"
      @click="emitApplyProfiles"
    >
      Add Profiles
    </v-btn>
    `
};
</script>

<style scoped lang="scss"></style>
