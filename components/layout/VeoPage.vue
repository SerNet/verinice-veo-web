<template>
  <v-col
    class="veo-page"
    :cols="absoluteSize ? cols : 12"
    :md="absoluteSize ? md : 12"
    :xl="absoluteSize ? xl : 12"
  >
    <v-row v-if="title" no-gutters class="flex-column veo-page__title">
      <v-col cols="12">
        <h1 class="ml-1 d-inline">{{ title }}</h1>
        <slot name="title" />
      </v-col>
    </v-row>
    <v-row
      v-if="showExtensionSlot"
      no-gutters
      class="veo-page__header"
      :class="stickyHeader ? 'veo-page__header--sticky' : ''"
    >
      <v-col cols="12" class="px-3 py-1">
        <slot name="header" />
      </v-col>
    </v-row>
    <v-row
      no-gutters
      style="max-height: 100%;"
      :class="noPadding ? '' : 'pa-4'"
    >
      <v-col
        :cols="!absoluteSize ? cols : 12"
        :md="!absoluteSize ? medium : 12"
        :xl="!absoluteSize ? xlarge : 12"
      >
        <slot name="default" />
      </v-col>
    </v-row>
  </v-col>
</template>
<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'

interface IProps {
  absoluteSize: boolean
  title?: string
  fullsize: boolean
  cols: number
  md: number
  xl: number
  noPadding: boolean
  stickyHeader: boolean
}

export default defineComponent<IProps>({
  props: {
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
    }
  },
  setup(props, context) {
    const medium = computed(() => {
      if (props.fullsize) {
        return 12
      } else if (props.md === 8 && props.cols <= 8) {
        return props.cols
      } else {
        return props.md
      }
    })

    const xlarge = computed(() => {
      if (props.fullsize) {
        return 12
      } else if (props.xl === 6 && props.cols <= 6) {
        return props.cols
      } else {
        return props.xl
      }
    })

    const showExtensionSlot = computed(() => {
      return !!context.slots.header
    })

    return { medium, xlarge, showExtensionSlot }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-page {
  flex-shrink: 1;
  margin: 0;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}

.veo-page__header {
  background: white;
  position: relative;
  top: 0;
  z-index: 4;
}

.veo-page__header--sticky {
  position: sticky;
}
</style>
