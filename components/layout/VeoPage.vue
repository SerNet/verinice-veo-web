<template>
  <v-col :cols="cols" :md="medium" :xl="xlarge" class="veo-page pa-0">
    <v-row v-if="title" dense class="align-center">
      <v-col cols="auto">
        <h1 class="ml-4">{{ title }}</h1>
      </v-col>
      <v-col cols="auto">
        <slot name="header" />
      </v-col>
    </v-row>
    <v-row no-gutters :style="{ height }" :class=" padding ? 'pa-4' : ''">
      <slot name="default" />
    </v-row>
  </v-col>
</template>
<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'

interface IProps {
  title?: string,
  height?: string,
  fullsize: boolean,
  cols: number,
  md: number,
  xl: number
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
    title: {
      type: String,
      default: undefined
    },
    height: {
      type: String,
      default: 'auto'
    },
    padding: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
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

    return { medium, xlarge }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

</style>
