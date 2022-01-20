<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <v-col
    class="veo-page py-0"
    :cols="12"
    :lg="fullsize ? 12 : 8"
    :xl="fullsize ? 12 : 7"
    :class="noPadding ? 'px-0' : isPageWrapperChild? 'px-10' : 'px-4'"
  >
    <VeoPageHeader v-bind="$props">
      <template #title>
        <slot name="title" />
      </template>
      <template #header>
        <slot name="header" />
      </template>
    </VeoPageHeader>
    <v-row
      no-gutters
      :style="{ 'max-height': '100%', 'min-height': 0, height }"
      class="pa-0 flex-column flex-nowrap"
    >
      <v-col :class="contentClass">
        <slot
          v-if="loading && loadContent"
          name="loading"
        >
          <v-skeleton-loader
            width="100%"
            type="image"
          />
          <v-skeleton-loader
            type="heading"
            class="pt-3"
            height="56"
            width="100%"
          />
          <v-skeleton-loader
            width="100%"
            type="image"
          />
        </slot>
        <slot
          v-else
          name="default"
        />
      </v-col>
      <v-col
        v-if="$slots.footer"
        :style="{ bottom: 0, position: stickyFooter ? 'sticky' : undefined, 'flex-grow': 0 }"
      >
        <slot name="footer" />
      </v-col>
    </v-row>
  </v-col>
</template>
<script lang="ts">
import { defineComponent, PropOptions } from '@nuxtjs/composition-api';

import { VeoPageHeaderAlignment } from './VeoPageHeader.vue';

interface IProps {
  contentClass: string;
  headingLevel: string | number;
  stickyHeader: boolean;
  fullsize: boolean;
  height: string;
  loading: boolean;
  loadContent: boolean;
  title?: string;
  titlebarAlignment: VeoPageHeaderAlignment;
  isPageWrapperChild: boolean;
}

export default defineComponent<IProps>({
  props: {
    contentClass: {
      type: String,
      default: ''
    },
    headingLevel: {
      type: [Number, String],
      default: 1
    },
    stickyHeader: {
      type: Boolean,
      default: false
    },
    stickyFooter: {
      type: Boolean,
      default: false
    },
    /**
     * If set to true, the page has 100% width on all viewports.
     */
    fullsize: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: 'auto'
    },
    /**
     * Shows a skeleton for the title if set to true
     */
    loading: {
      type: Boolean,
      default: false
    },
    /**
     * If this and loading is set, show a skeleton in the content area. Can be customized with slot#loading
     */
    loadContent: {
      type: Boolean,
      default: false
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    /**
     * The title of the page. Used to standardtize headings
     */
    title: {
      type: String,
      default: undefined
    },
    titlebarAlignment: {
      type: Number,
      default: VeoPageHeaderAlignment.LEFT
    } as PropOptions<VeoPageHeaderAlignment>,
    isPageWrapperChild: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {};
  }
});
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-page {
  display: flex;
  flex-direction: column;
  flex-shrink: 1;
  margin: 0;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}
</style>
