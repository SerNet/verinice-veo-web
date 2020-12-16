<template>
  <div class="veo-page" style="width: 100%;">
    <v-row v-if="title" dense class="align-center">
      <v-col cols="auto">
        <h1 class="ml-4">{{ title }}</h1>
      </v-col>
      <v-col cols="auto">
        <slot name="header" />
      </v-col>
    </v-row>
    <v-row no-gutters class="fill-height" :class=" noPadding ? '' : 'pa-4'">
      <v-col :cols="cols" :md="medium" :xl="xlarge">
        <slot name="default" />
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'

interface IProps {
  title?: string,
  fullsize: boolean,
  cols: number,
  md: number,
  xl: number,
  fixedWidth: boolean,
  noPadding: boolean
}

export default defineComponent<IProps>({
  props: {
    fullsize: {
      type: Boolean,
      default: false
    },
    cols: {
      type: Number,
      default: 12
    },
    md: {
      type: Number,
      default: 8
    },
    xl: {
      type: Number,
      default: 6
    },
    fixedWidth: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: undefined
    },
    noPadding: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const medium = computed(() => {
      if (props.fullsize) {
        return 12
      } else if (props.fixedWidth) {
        return props.cols
      } else if (props.md === 8 && props.cols <= 8) {
        return props.cols
      } else {
        return props.md
      }
    })

    const xlarge = computed(() => {
      if (props.fullsize) {
        return 12
      } else if (props.fixedWidth) {
        return props.cols
      } else if (props.xl === 6 && props.cols <= 6) {
        return props.cols
      } else {
        return props.xl
      }
    })

    return { medium, xlarge }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

</style>
