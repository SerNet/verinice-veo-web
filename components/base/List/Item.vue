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
  <v-col cols="12" class="flex-1-1-100">
    <v-card :loading="false" data-veo-test="veo-card">
      <div data-veo-test="item-card-slot-prepend" class="veo-base-card__slot-prepend" style="padding: 0">
        <slot :item="item" name="prepend"></slot>
      </div>

      <div class="veo-base-card__slot-center" data-veo-test="item-card-slot-center">
        <div>
          <!-- Item details are a link -->
          <NuxtLink
            v-if="item.link || itemUrl"
            :to="itemUrl ? itemUrl : item.link"
            class="veo-base-card__slot-center__main"
            data-veo-test="item-card-slot-center-link"
            data-component-name="item-card-slot-center-link"
          >
            <ItemDetails v-if="!hasDetailsSlot" :item="item" />
            <slot :item="item" name="details"></slot>
          </NuxtLink>

          <!-- Item details are a label -->
          <!-- If using labels: Make sure associated inputs have an id of `item.id` -->
          <label
            v-if="hasLabel"
            :for="item.id"
            class="veo-base-card__slot-center__main"
            data-veo-test="item-card-slot-center-link"
            data-component-name="item-card-slot-center-link"
          >
            <ItemDetails v-if="!hasDetailsSlot" :item="item" />
            <slot :item="item" name="details"></slot>
          </label>

          <!-- Item details are text -->
          <div
            v-if="!item.link && !hasLabel && !itemUrl"
            class="veo-base-card__slot-center__main"
            data-veo-test="item-card-slot-center-link"
            data-component-name="item-card-slot-center-link"
          >
            <ItemDetails v-if="!hasDetailsSlot" :item="item" />
            <slot :item="item" name="details"></slot>
          </div>

          <div data-veo-test="item-card-slot-center-aside" class="veo-base-card__slot-center__aside">
            <slot :item="item" name="center-aside"></slot>
          </div>
        </div>

        <v-card-actions v-if="hasBottomSlots" class="veo-card-actions">
          <div data-veo-test="item-card-slot-left" class="veo-card-actions__slot-left">
            <slot :item="item" name="bottom-left"></slot>
          </div>

          <div class="veo-base-card-actions__slot-append">
            <slot :item="item" name="bottom-right"></slot>
          </div>
        </v-card-actions>
      </div>
    </v-card>
  </v-col>
</template>
<script setup lang="ts">
import type { TInlineComponent } from '~/types/utils';

interface Props {
  item: any;
  hasLabel?: boolean;
  itemUrl?: string;
}
const { t, locale } = useI18n();
withDefaults(defineProps<Props>(), {
  hasLabel: false,
  itemUrl: undefined
});

const slots = useSlots();
const hasDetailsSlot = computed(() => !!slots?.['details']);
const hasBottomSlots = computed(() => !!(slots?.['bottom-right'] || slots?.['bottom-left']));
function getItemField(item: any, field: 'name' | 'description'): string {
  if (!item) return '';
  return !item.domainId ? item?.translations?.[locale.value]?.[field] : item?.[field];
}

const ItemDetails: TInlineComponent = {
  props: ['item'],
  data: () => ({ t, locale }),
  computed: {
    itemName(): string {
      return getItemField(this.item, 'name');
    },
    itemDescription(): string {
      return getItemField(this.item, 'description') ?? t('noDescription');
    }
  },
  template: `
    <v-card-title v-text="itemName"></v-card-title>
    <v-card-subtitle v-if="item?.metaData" v-text="item.metaData"></v-card-subtitle>
    <v-card-text data-veo-test="item-card-text"  v-text="itemDescription"></v-card-text>
`
};
</script>

<i18n src="~/locales/base/components/base-list-item.json"></i18n>

<style scoped lang="scss">
.v-card {
  display: flex;
}

.veo-base-card__slot-center {
  flex: 1;

  > div:first-child {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  /* reset padding */
  a > * {
    padding-left: 8px;
    white-space: break-spaces;
  }

  :deep(a:hover .v-card-title) {
    text-decoration: underline;
  }
}

.veo-base-card__slot-center__main {
  text-decoration: none;
  color: var(--veo-text, rgba(0, 0, 0, 0.87)) !important;
  display: flex;
  flex-direction: column;
}

.veo-base-card__slot-center__aside {
  padding: 8px;
  flex-direction: column;
}

.veo-card-actions__slot-left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  > * {
    margin: 0 !important;
  }
}
.veo-base-card-actions__slot-append {
  margin-left: auto;
}

.v-theme--dark {
  /* Dark mode text color */
  --veo-text: white;
}
</style>
