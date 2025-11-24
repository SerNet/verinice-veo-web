<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi
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
  <BaseContainer v-if="isCardViewVisible" class="pt-0">
    <template v-for="object in cardItems" :key="object.value">
      <BaseListItem
        v-model:sort-by="localSortBy"
        :item="object"
        :item-url="getObjectUrl(object)"
        title=""
        select
        class="pt-0"
        @update:sort-by="updateSortBy"
      >
        <template #details>
          <Details :name="object.displayName" :description="setObjectDetails(object, ['description'])" />
        </template>
        <template #prepend>
          <div class="d-flex justify-center prepend-icon ml-2">
            <v-icon :icon="renderIcon(object)" :size="'x-small'" />
            <Icon
              :icon="getSourceIcon(object)"
              :tooltip-translation="getSourceTooltip(object)"
              :color="getSourceColor(object)"
              size="small"
              class="mr-1 mt-1"
            />
          </div>
        </template>
        <template #center-aside>
          <div class="d-flex justify-end">
            <v-tooltip v-for="btn in actions" :key="btn.id" location="start">
              <template #activator="{ props: properties }">
                <v-btn
                  :disabled="!ability.can('manage', subject('units', { id: route.params.unit })) || btn.disabled"
                  :icon="btn.icon"
                  v-bind="properties"
                  variant="text"
                  :aria-label="btn.label"
                  @click="btn.action(object)"
                />
              </template>
              {{ btn.label }}
            </v-tooltip>
          </div>
        </template>
        <template #bottom-left>
          <Status :state="setObjectDetails(object, ['designator', 'abbreviation', 'status', 'source'])" />
        </template>

        <template #bottom-right>
          <Status :state="setObjectDetails(object, ['updatedBy', 'updatedAt'])" />
        </template>
      </BaseListItem>
    </template>

    <v-card style="width: 98%; margin: 0 auto; border: 1px solid #ccc; border-radius: 6px; padding: 6px">
      <v-row align="center" justify="space-between">
        <v-col cols="3" class="d-flex align-center">
          <v-select
            v-model="tablePageSize"
            :items="[10, 25, 50, 100]"
            label="Einträge pro Seite"
            variant="outlined"
            style="height: 60px; min-width: 20%"
            outlined
          />
        </v-col>

        <v-col cols="9" class="d-flex justify-end">
          <v-pagination
            v-model="cardsPage"
            start="1"
            total-visible="1"
            show-first-last-page
            :length="pageCount"
            class="mr-4"
            style="text-align: right; min-width: 40%; border: 2px solid #ccc; border-radius: 4px; padding: 1px"
            @update:model-value="cardsPageChange"
          />
        </v-col>
      </v-row>
    </v-card>
  </BaseContainer>
</template>

<script setup lang="ts">
import { mdiAccountEdit, mdiBookOpenPageVariantOutline } from '@mdi/js';
import ObjectIcon from '~/components/object/Icon.vue';
import type { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import type { IVeoEntity, IVeoLink, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

// Props
const props = defineProps<{
  cardItems: IVeoEntity[];
  fetchedItems: IVeoPaginatedResponse<IVeoEntity[]>;
  sortBy: any;
  actions: Array<{ id: string; icon: string; label: string; action: (object: any) => void; disabled?: boolean }>;
  translations: IVeoTranslations;
  cardsPageChange: (page: number) => void;
  isCardViewVisible: boolean;
}>();
const emit = defineEmits<{ 'update:sortBy': [sort: { key: string; order: string }] }>();

// Use the custom feature flag composable
const route = useRoute();
const { t: globalT, locale } = useI18n({ useScope: 'global' });
const { tablePageSize } = useVeoUser();
const { ability, subject } = useVeoPermissions();

const cardsPage = ref(1);
const localSortBy = ref(props.sortBy);

// Card View
const { formatDateTime } = useFormatters();

function updateSortBy(key: string) {
  emit('update:sortBy', { key, order: localSortBy.value.order === 'asc' ? 'desc' : 'asc' });
}

const pageCount = computed(() => {
  return Math.max(1, props.fetchedItems?.pageCount);
});

const getObjectUrl = (object: IVeoEntity) => {
  return `/${object.owner.id}/domains/${route.params.domain}/${VeoElementTypePlurals[object.type]}/${object.subType}/${object.id}/`;
};

/**
 * Render folder or file icons
 */
const renderIcon = (object: any) => {
  return (props: any) =>
    h(ObjectIcon, {
      ...props, // Ensure you pass any incoming props to the rendered icon
      objectType: object.type,
      isComposite: !!object.parts?.length
    });
};
/**
 * Render translated status
 */
const renderStatus = (item: any): string => {
  const key = `${item.type}_${item.subType}_status_${item.status}`;
  return props.translations?.lang?.[locale.value]?.[key] || item?.status || '';
};

/**
 * Render date column using date formatter
 */
const renderDate: any = (object: any) => {
  return object.updatedAt ? formatDate(object.updatedAt) : '';
};

const formatDate: any = (v: any) => {
  try {
    return formatDateTime(new Date(v)).value;
  } catch (_e) {
    return '';
  }
};

type ObjectDetails = {
  designator: string;
  status: string;
  abbreviation?: string;
  updatedBy: string;
  updatedAt: string;
  description?: string;
  appliedCatalogItem?: IVeoLink;
};

const setObjectDetails = (object: ObjectDetails, keys: string[]) => {
  const details: { [key: string]: string } = {};
  keys.forEach((key) => {
    switch (key) {
      case 'designator':
        details[globalT('objectlist.designator')] = object.designator;
        break;
      case 'status':
        details[globalT('objectlist.status')] = renderStatus(object);
        break;
      case 'abbreviation':
        details[globalT('objectlist.abbreviation')] = object.abbreviation;
        break;
      case 'description':
        details[globalT('objectlist.description')] = object.description;
        break;
      case 'updatedBy':
        details[globalT('objectlist.updatedBy')] = object.updatedBy;
        break;
      case 'updatedAt':
        details[globalT('objectlist.updatedAt')] = renderDate(object);
        break;

      default:
        console.info(`Unexpected updated key: ${key}`);
    }
  });

  return details;
};

// Source icon helpers for cards
const getSourceIcon = (object: IVeoEntity) =>
  object?.appliedCatalogItem ? mdiBookOpenPageVariantOutline : mdiAccountEdit;
const getSourceTooltip = (object: IVeoEntity) =>
  object?.appliedCatalogItem ? globalT('breadcrumbs.catalog') : globalT('sourceTooltip');
const getSourceColor = (object: IVeoEntity) => (object?.appliedCatalogItem ? 'blue' : undefined);

const statusColor = (status: string) => {
  switch (status) {
    case 'Neu':
      return 'red'; //'dark-grey';
    case 'In Bearbeitung':
      return 'orange';
    case 'Zur Prüfung':
      return 'blue';
    case 'Freigegeben':
      return 'green';
    default:
      return 'dark-grey';
  }
};

const formatState = (state: object) => {
  const keys = Object.keys(state);
  if (keys.length > 0) {
    const key = keys[0];
    return `${key}: ${state[key]}`;
  }
  return '';
};

const Status = {
  props: {
    state: {
      type: Object as PropType<Record<string, string>>,
      required: true
    }
  },
  data() {
    return {
      t: ''
    };
  },
  computed: {
    stateColors(this: Record<string, string>) {
      return Object.fromEntries(Object.entries(this.state).map(([key, value]) => [key, statusColor(value)]));
    },
    formattedState(this: any): string {
      return formatState(this.state); // Use `this` to access props
    }
  },
  template: `

    <div style="display: flex; justify-content: flex-end; width: 100%; gap: 4px">
      <v-chip
        v-for="(value, key) in state"
        :key="key"
        data-veo-test="item-card-text-state"
        :style="{ color: stateColors[key] }"
        size="small"
        label>
        {{ key }}: {{ value }}
      </v-chip>
    </div>

  `
};

const Details = {
  props: {
    name: {
      type: String,
      required: true
    },
    description: {
      type: Object as PropType<Record<string, any> | null>,
      required: false,
      default: () => ({})
    },
    meta: {
      type: String,
      required: false,
      default: null
    },
    details: {
      type: Object as PropType<Record<string, any> | null>, // Adjust based on expected structure
      required: false,
      default: null
    },
    sourceIcon: {
      type: [String, Array] as PropType<string | string[]>,
      required: false,
      default: undefined
    },
    sourceTooltip: {
      type: String,
      required: false,
      default: ''
    },
    sourceColor: {
      type: String,
      required: false,
      default: undefined
    }
  },
  data() {
    return {
      t: ''
    };
  },
  template: `
    <v-card-title v-text="name"></v-card-title>
    <v-card-subtitle v-if="meta" v-text="meta"></v-card-subtitle>
    <v-card-text
      v-if="description && Object.keys(description).length > 0"
      data-veo-test="item-card-text" class="overflow-y-auto text-body-2">
  <span
    v-if="description && Object.values(description).every((value) => typeof value === 'string')"
    v-for="(value, key) in description"
    :key="key"
    class="overflow-y-auto text-body-2 custom-pre"
  >
    <p style="white-space: pre-wrap">{{ value }}</p>
      </span>
    </v-card-text>
  `
};
</script>

<style scoped lang="scss">
.prepend-icon {
  display: flex;
  flex-direction: column; /* stack main and source icon vertically */
  align-items: center;
  justify-content: flex-start;
  width: 30px;
}

.prepend-icon .v-icon {
  height: 35px;
}
</style>
