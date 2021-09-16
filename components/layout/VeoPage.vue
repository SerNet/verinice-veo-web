<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Jonas Heitmann
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
    class="veo-page"
    :cols="absoluteSize ? cols : 12"
    :md="absoluteSize ? medium : 12"
    :xl="absoluteSize ? xlarge : 12"
    :class="pageClass"
  >
    <v-row
      v-if="title"
      no-gutters
      class="flex-column veo-page__title"
    >
      <v-col
        :cols="!absoluteSize ? cols : 12"
        :md="!absoluteSize ? medium : 12"
        :xl="!absoluteSize ? xlarge : 12"
        class="d-flex flex-wrap"
      >
        <v-skeleton-loader
          v-if="loading"
          class="px-4 py-1 skeleton-title"
          type="text"
        />
        <template v-else>
          <h1 class="d-inline px-4 py-1 flex-grow-0">
            {{ title }}
            <slot name="title" />
          </h1>
        </template>        
      </v-col>
    </v-row>
    <v-row
      v-if="showExtensionSlot"
      no-gutters
      class="veo-page__header"
      :class="stickyHeader ? 'veo-page__header--sticky' : ''"
    >
      <v-col
        :cols="!absoluteSize ? cols : 12"
        :md="!absoluteSize ? medium : 12"
        :xl="!absoluteSize ? xlarge : 12"
        class="px-4 py-1"
      >
        <slot name="header" />
      </v-col>
    </v-row>
    <v-row
      no-gutters
      :style="{ 'max-height': '100%', 'min-height': 0, height }"
      :class="noPadding ? '' : 'pa-4'"
    >
      <v-col
        :cols="!absoluteSize ? cols : 12"
        :md="!absoluteSize ? medium : 12"
        :xl="!absoluteSize ? xlarge : 12"
        :class="contentClass"
      >
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
    </v-row>
  </v-col>
</template>
<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';

interface IProps {
  absoluteSize: boolean;
  title?: string;
  fullsize: boolean;
  cols: number;
  md: number;
  xl: number;
  noPadding: boolean;
  stickyHeader: boolean;
  pageClass: string;
  contentClass: string;
  height: string;
}

export default defineComponent<IProps>({
  props: {
    pageClass: {
      type: String,
      default: ''
    },
    contentClass: {
      type: String,
      default: ''
    },
    stickyHeader: {
      type: Boolean,
      default: false
    },
    /**
     * If set to true, cols, md and xl are applied to the outer element (default is false as in this case the page handles its max-size itself while applying the scrollbar to the outer element)
     */
    absoluteSize: {
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
     * The size of the page on viewports smaller than md
     */
    cols: {
      type: Number,
      default: 12
    },
    /**
     * The size of the page on viewports smaller than xl
     */
    md: {
      type: Number,
      default: 8
    },
    /**
     * The size of the page on viewports bigger than xl
     */
    xl: {
      type: Number,
      default: 6
    },
    /**
     * The title of the page. Used to standardtize headings
     */
    title: {
      type: String,
      default: undefined
    },
    /**
     * Removes the default padding from the page's content
     */
    noPadding: {
      type: Boolean,
      default: false
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
    }
  },
  setup(props, context) {
    const medium = computed(() => {
      if (props.fullsize) {
        return 12;
      } else if (props.md === 8 && props.cols <= 8) {
        return props.cols;
      } else {
        return props.md;
      }
    });

    const xlarge = computed(() => {
      if (props.fullsize) {
        return 12;
      } else if (props.xl === 6 && props.cols <= 6) {
        return props.cols;
      } else {
        return props.xl;
      }
    });

    const showExtensionSlot = computed(() => {
      return !!context.slots.header;
    });

    return { medium, xlarge, showExtensionSlot };
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

.veo-page__title {
  background: white;
  flex-grow: 0;
}

.veo-page__header {
  background: white;
  flex-grow: 0;
  position: relative;
  top: 0;
  z-index: 4;
}

.veo-page__header--sticky {
  position: sticky;
}

.skeleton-title {
  align-items: center;
  display: flex;
  height: 56px;
  width: 300px;

  ::v-deep .v-skeleton-loader__text {
    height: 32px;
  }
}
</style>
