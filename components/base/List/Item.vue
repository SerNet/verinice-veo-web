<template>
  <v-col cols="12">
    <v-card :loading="false" data-veo-test="veo-card">
      <div data-veo-test="item-card-slot-prepend" class="veo-base-card__slot-prepend" style="padding: 0">
        <slot :item="item" name="prepend" />
      </div>

      <div class="veo-base-card__slot-center" data-veo-test="item-card-slot-center">
        <div>
          <NuxtLink
            v-if="item.link"
            :to="item.link"
            class="veo-base-card__slot-center__main"
            data-veo-test="item-card-slot-center-link"
          >
            <ItemDetails :item="item" />
          </NuxtLink>

          <div v-if="!item.link" class="veo-base-card__slot-center__main" data-veo-test="item-card-slot-center-link">
            <ItemDetails :item="item" />
          </div>

          <div data-veo-test="item-card-slot-center-aside" class="veo-base-card__slot-center__aside">
            <slot :item="item" name="center-aside"></slot>
          </div>
        </div>

        <v-card-actions class="veo-card-actions" v-if="hasBottomSlots">
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
}
defineProps<Props>();

const slots = useSlots();
const hasBottomSlots = computed(() => !!(slots?.['bottom-right'] || slots?.['bottom-left']));
const { t } = useI18n();

const ItemDetails: TInlineComponent = {
  props: ['item'],
  data: () => ({ t }),
  template: `
    <v-card-title v-text="item.name"></v-card-title>
    <v-card-subtitle v-if="item.metaData" v-text="item.metaData"></v-card-subtitle>
    <v-card-text data-veo-test="item-card-text" v-text="item.description || t('noDescription')"></v-card-text>
`
};
</script>

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
  a:hover div:first-child {
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

<i18n>
{
  "en": {
    "noDescription": "No description available."
  },
  "de": {
    "noDescription": "Keine Beschreibung verfügbar."
  }
}
</i18n>
